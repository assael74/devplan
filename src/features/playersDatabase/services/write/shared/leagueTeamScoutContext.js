import { SCOUTING_MODEL_VERSION } from '../../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../../shared/scouting/teams/index.js'
import { adaptTeamScoutEngineRow } from '../../../domain/adapters/teamScoutEngine.adapter.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../../model/teamIdentity.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/season.model.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  buildLeagueTeamPerformanceProjection,
} from '../../../domain/projections/teamPerformance.projection.js'
import {
  resolveClubLevel,
  resolveClubStrengthLevel,
} from './teamClubContext.js'

const buildCanonicalLeagueSeason = ({ league = {}, season = {}, target, rows = [] } = {}) => {
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const canonicalSeason = {
    ...season,
    tableRank: Array.isArray(rows) ? rows : [],
  }

  if (clean(target) === 'history') {
    const history = (Array.isArray(league.history) ? league.history : [])
      .filter(candidate => clean(candidate?.seasonKey || candidate?.seasonId) !== seasonKey)
    return {
      ...league,
      history: [...history, canonicalSeason],
    }
  }

  return {
    ...league,
    current: canonicalSeason,
  }
}

const buildScoutRows = rows => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const clubLevel = resolveClubLevel({
      clubId: row.clubId,
      clubLevel: row.clubLevel,
    })
    const clubStrengthLevel = resolveClubStrengthLevel({
      clubId: row.clubId,
      clubLevel,
      clubStrengthLevel: row.clubStrengthLevel,
    })

    return {
      ...row,
      clubLevel,
      clubStrengthLevel,
    }
  })
)

const resolveLeagueTableRankRows = ({ league = {}, season = {}, target = 'current' } = {}) => {
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const current = league?.current
  const history = Array.isArray(league?.history) ? league.history : []
  const historicalSeason = history.find(candidate => (
    isSameSeason(candidate, seasonIdentity)
  ))
  const currentSeason = current && isSameSeason(current, seasonIdentity)
    ? current
    : null
  const resolvedSeason = clean(target) === 'history'
    ? historicalSeason || currentSeason
    : currentSeason || historicalSeason

  return Array.isArray(resolvedSeason?.tableRank)
    ? resolvedSeason.tableRank
    : []
}

// Canonical League table context for both Team Season enrichment and the
// Team SearchIndex projection. SearchIndex documents are never an input here.
export const buildCanonicalLeagueTeamScoutContexts = ({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) => {
  const scoutRows = buildScoutRows(rows)
  const canonicalLeague = buildCanonicalLeagueSeason({
    league,
    season,
    target,
    rows: scoutRows,
  })
  const engineResult = buildTeamScoutLeagueModel({
    leagueLevel: league.level,
    leagueNumGames: season.leagueTotalRound || 30,
    rows: scoutRows,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const scoutResultByTeam = new Map(
    (Array.isArray(engineResult?.rows) ? engineResult.rows : []).map(row => [
      clean(resolveTeamLookupKey(row) || row.clubId || row.rank),
      row,
    ])
  )

  return {
    scoutRows,
    contexts: scoutRows.map(row => {
      const rowKey = clean(resolveTeamLookupKey(row) || row.clubId)
      const scoutResult = scoutResultByTeam.get(rowKey) || null
      const teamPerformance = buildLeagueTeamPerformanceProjection({
        league: canonicalLeague,
        season,
        target,
        team: row,
      })
      const scoutPerformance = adaptTeamScoutEngineRow({
        row: scoutResult || {},
        source: {
          normalization: engineResult?.normalization || {},
          leagueLevel: engineResult?.leagueLevel || league.level,
          leagueGames: engineResult?.leagueNumGames || season.leagueTotalRound,
          engineVersion: SCOUTING_MODEL_VERSION,
          calculatedAt: season.updatedAt || null,
        },
      })

      return {
        row,
        teamPerformance,
        scoutResult,
        scoutPerformance,
      }
    }),
  }
}

// League-only Team SearchIndex projections must be rebuilt from the League
// table and catalog context, never from an existing SearchIndex document.
export const buildCanonicalLeagueTeamScoutContext = ({
  league = {},
  season = {},
  target = 'current',
  team = {},
} = {}) => {
  const { contexts } = buildCanonicalLeagueTeamScoutContexts({
    league,
    season,
    target,
    rows: resolveLeagueTableRankRows({ league, season, target }),
  })
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamIds = new Set([
    teamIdentity.birthTeamDocumentId,
    teamIdentity.birthTeamId,
    teamIdentity.teamDocumentId,
    teamIdentity.teamId,
  ].map(clean).filter(Boolean))
  if (!teamIds.size) return null

  // Team resolution is intentionally identity-only: a club may own several
  // teams, so clubId is never a matching criterion or a fallback.
  const matches = contexts.filter(context => {
    const rowIdentity = normalizeTeamIdentity({ team: context?.row || {} })
    return (
      [
        rowIdentity.birthTeamDocumentId,
        rowIdentity.birthTeamId,
        rowIdentity.teamDocumentId,
        rowIdentity.teamId,
      ].map(clean).some(id => teamIds.has(id)) &&
      rowIdentity.birthTeamSlot === teamIdentity.birthTeamSlot
    )
  })

  return matches.length === 1 ? matches[0] : null
}
