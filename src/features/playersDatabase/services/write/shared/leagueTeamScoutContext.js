import {
  SCOUTING_MODEL_VERSION,
  TEAM_SCOUT_PERFORMANCE_VERSION,
} from '../../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../../shared/scouting/teams/index.js'
import { adaptTeamScoutEngineRow } from '../../../domain/adapters/teamScoutEngine.adapter.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../../model/team/teamIdentity.model.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
} from '../../../model/shared/season.model.js'
import { clean } from '../leagues/leagueDoc.js'
import { pickDefinedValue } from '../../../model/shared/value.model.js'
import {
  buildLeagueTeamPerformanceProjection,
} from '../../../domain/projections/teamPerformance.projection.js'
import { buildLeagueTeamSeasons } from '../../../domain/orchestration/buildLeagueTeamSeasons.js'
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

const buildTeamPerformanceContext = ({
  engineResult = {},
  season = {},
  reusePersistedContext = true,
} = {}) => {
  const existingContext = season?.teamPerformanceContext
  const existingFactor = Number(existingContext?.appliedFactor)
  if (
    reusePersistedContext &&
    existingContext?.version &&
    Number.isFinite(existingFactor) &&
    existingFactor > 0
  ) {
    return {
      ...existingContext,
      appliedFactor: existingFactor,
      calculatedAt: existingContext.calculatedAt || season.updatedAt || new Date().toISOString(),
    }
  }

  const normalization = engineResult?.normalization || {}

  return {
    version: TEAM_SCOUT_PERFORMANCE_VERSION,
    normalizationMode: clean(normalization.mode) || TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    appliedFactor: Number(normalization.appliedFactor) || 1,
    benchmarkGoalsPerTeamGame: pickDefinedValue(
      normalization.benchmarkGoalsPerTeamGame,
      null
    ),
    leagueGoalsPerTeamGame: pickDefinedValue(
      normalization.leagueGoalsPerTeamGame,
      null
    ),
    calculatedAt: season.updatedAt || new Date().toISOString(),
  }
}

// Canonical League table context for both Team Season enrichment and the
// Team SearchIndex projection. SearchIndex documents are never an input here.
export const buildCanonicalLeagueTeamScoutContexts = ({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  reusePersistedContext = true,
} = {}) => {
  const scoutRows = buildScoutRows(rows)
  const persistedFactor = Number(season?.teamPerformanceContext?.appliedFactor)
  const hasPersistedFactor = reusePersistedContext &&
    Number.isFinite(persistedFactor) &&
    persistedFactor > 0
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
    normalizationMode: hasPersistedFactor
      ? TEAM_SCOUT_NORMALIZATION_MODE.MANUAL
      : TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    normalizationFactor: hasPersistedFactor ? persistedFactor : undefined,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const scoutResultByTeam = new Map(
    (Array.isArray(engineResult?.rows) ? engineResult.rows : []).map(row => [
      clean(resolveTeamLookupKey(row) || row.clubId || row.rank),
      row,
    ])
  )
  const teamPerformanceContext = buildTeamPerformanceContext({
    engineResult,
    season,
    reusePersistedContext,
  })

  return {
    scoutRows,
    teamPerformanceContext,
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
          normalization: {
            mode: teamPerformanceContext.normalizationMode,
            factor: teamPerformanceContext.appliedFactor,
            applied: Number(teamPerformanceContext.appliedFactor) !== 1,
          },
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

// Club projections and the Audit must use the same League-derived priority
// result. This adapter keeps the full engine output runtime-only and adds only
// the compact sides needed by Club persistence.
export const buildLeagueRowsWithScoutPerformance = ({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const performanceByTeamId = new Map(buildLeagueTeamSeasons({
    leagueDocument: league,
    seasonDocument: { ...season, tableRank: safeRows },
    target,
  }).map(item => [
    clean(item?.identity?.teamId || item?.identity?.teamDocumentId),
    item?.performance || null,
  ]))

  return safeRows.map(row => {
    const performance = performanceByTeamId.get(clean(resolveTeamLookupKey(row))) || null
    return {
      ...row,
      teamAttackPerformance: performance?.offense || null,
      teamDefensePerformance: performance?.defense || null,
    }
  })
}
