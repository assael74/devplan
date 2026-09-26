import { SCOUTING_MODEL_VERSION } from '../../../../shared/scouting/scouting.version.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../../shared/scouting/teams/index.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../../catalog/teamDisplay.js'
import { adaptTeamScoutEngineRow } from '../adapters/teamScoutEngine.adapter.js'
import { buildTeamSeasonSearchMetrics } from './searchIndexNormalization.projection.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
  getLeagueTableRowStats,
} from './teamPerformance.projection.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../model/team/teamIdentity.model.js'
import { normalizeSeasonIdentity } from '../../model/shared/season.model.js'
import {
  cleanValue,
  pickDefinedValue,
  toNumberOrZero,
} from '../../model/shared/value.model.js'

const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const direct = Number(clubLevel)
  if (Number.isFinite(direct) && direct > 0) return direct

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => (
    item.id === cleanValue(clubId)
  ))
  return toNumberOrZero(club?.clubLevel)
}

const resolveClubStrengthLevel = ({
  clubId = '',
  clubLevel = null,
  clubStrengthLevel = null,
} = {}) => {
  const direct = Number(clubStrengthLevel)
  if (Number.isFinite(direct) && direct > 0) return direct

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => (
    item.id === cleanValue(clubId)
  ))
  const catalogStrength = Number(club?.clubStrengthLevel)
  if (Number.isFinite(catalogStrength) && catalogStrength > 0) {
    return catalogStrength
  }

  return resolveClubLevel({ clubId, clubLevel })
}

const resolveNeedLevel = ({ needs = [], id = '' } = {}) => {
  const need = (Array.isArray(needs) ? needs : []).find(item => item?.id === id)
  return cleanValue(need?.level) || 'none'
}

const roundOptionalWholeNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : null
}

const buildLeagueScoutProjection = ({ league = {}, season = {}, scoutResult = null } = {}) => {
  const source = scoutResult || {}
  const performance = adaptTeamScoutEngineRow({
    row: source,
    source: {
      engineVersion: SCOUTING_MODEL_VERSION,
      normalization: source.normalization || {},
      leagueLevel: league.level,
      leagueGames: season.leagueTotalRound,
      calculatedAt: season.updatedAt || null,
    },
  })
  const offense = performance.offense
  const defense = performance.defense

  return {
    attackScoutPriorityScore: roundOptionalWholeNumber(
      pickDefinedValue(offense?.scoutPriorityScore, offense?.scoutPriorityRate)
    ),
    attackPriorityLevel: pickDefinedValue(offense?.priorityLevel, ''),
    attackOpportunityType: pickDefinedValue(offense?.opportunityType, ''),
    defenseScoutPriorityScore: roundOptionalWholeNumber(
      pickDefinedValue(defense?.scoutPriorityScore, defense?.scoutPriorityRate)
    ),
    defensePriorityLevel: pickDefinedValue(defense?.priorityLevel, ''),
    defenseOpportunityType: pickDefinedValue(defense?.opportunityType, ''),
    teamScoutEngineVersion: SCOUTING_MODEL_VERSION,
    scoutCompetitionRelation: cleanValue(source.scoutContext?.competition?.relation),
    scoutCompetitionGap: source.scoutContext?.competition?.gap === null ||
      source.scoutContext?.competition?.gap === undefined
      ? null
      : Number(source.scoutContext.competition.gap),
    attackingNeedLevel: resolveNeedLevel({ needs: source.needs, id: 'attacking_need' }),
    defensiveNeedLevel: resolveNeedLevel({ needs: source.needs, id: 'defensive_need' }),
    balanceProblemLevel: resolveNeedLevel({ needs: source.needs, id: 'balance_problem' }),
    recruitmentWindow: cleanValue(source.recruitmentOpportunity?.window) || 'none',
  }
}

export const buildTeamSeasonSearchIndexId = ({
  leagueId = '',
  seasonKey = '',
  teamId = '',
} = {}) => [
  'birthTeamSeason',
  cleanValue(leagueId),
  cleanValue(seasonKey).replace(/[^0-9a-zA-Z]+/g, '_'),
  cleanValue(teamId),
].filter(Boolean).join('__')

export const buildLeagueTeamSearchIndexProjections = ({
  league = {},
  season = {},
  target = 'current',
  rows = [],
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const scoutRows = safeRows.map(row => {
    const clubLevel = resolveClubLevel({ clubId: row.clubId, clubLevel: row.clubLevel })
    return {
      ...row,
      clubLevel,
      clubStrengthLevel: resolveClubStrengthLevel({
        clubId: row.clubId,
        clubLevel,
        clubStrengthLevel: row.clubStrengthLevel,
      }),
    }
  })
  const engine = buildTeamScoutLeagueModel({
    leagueLevel: league.level,
    leagueNumGames: season.leagueTotalRound || 30,
    rows: scoutRows,
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const scoutByTeam = new Map(
    (Array.isArray(engine?.rows) ? engine.rows : []).map(row => [
      cleanValue(resolveTeamLookupKey(row) || row.clubId || row.rank),
      row,
    ])
  )
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const leagueId = cleanValue(league.id || league.leagueId || season.leagueId)

  return scoutRows.map(row => {
    const identity = normalizeTeamIdentity({ team: row })
    const teamId = cleanValue(
      identity.birthTeamDocumentId || identity.birthTeamId || identity.teamDocumentId || identity.teamId
    )
    if (!teamId) return null

    const performance = buildTeamPerformanceProjectionFromTableRows({
      rows: scoutRows,
      team: row,
    })
    if (!performance) return null

    const stats = getLeagueTableRowStats(row)
    const scoutResult = scoutByTeam.get(cleanValue(resolveTeamLookupKey(row) || row.clubId)) || null
    const id = buildTeamSeasonSearchIndexId({
      leagueId,
      seasonKey: seasonIdentity.seasonKey,
      teamId,
    })
    const displayName = buildTeamDisplayName({
      clubName: row.clubName || row.displayName,
      clubId: identity.clubId,
      teamId,
      teamSlot: identity.birthTeamSlot,
    })

    return {
      id,
      teamId,
      teamSeasonDocumentId: `${teamId}__${cleanValue(seasonIdentity.seasonKey).replace(/[^0-9a-zA-Z]+/g, '_')}`,
      performance,
      document: {
        id,
        entityType: 'birthTeamSeason',
        entityId: id,
        displayName,
        normalizedDisplayName: cleanValue(displayName).toLowerCase(),
        leagueId,
        seasonId: seasonIdentity.seasonId,
        seasonKey: seasonIdentity.seasonKey,
        clubId: identity.clubId,
        clubLevel: row.clubLevel,
        clubStrengthLevel: row.clubStrengthLevel,
        birthTeamId: teamId,
        birthTeamDocumentId: identity.birthTeamDocumentId || teamId,
        birthTeamSlot: identity.birthTeamSlot || 1,
        teamId,
        teamDocumentId: identity.birthTeamDocumentId || identity.teamDocumentId || teamId,
        teamUrl: cleanValue(row.teamUrl),
        seasonUrl: cleanValue(season.seasonUrl),
        ageGroupId: cleanValue(row.ageGroupId || league.ageGroupId),
        ageGroupLabel: cleanValue(row.ageGroupLabel || league.ageGroupLabel),
        birthYear: toNumberOrZero(season.birthYear),
        leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
        leagueLevel: toNumberOrZero(league.level),
        expectedLevelDelta: row.expectedLevelDelta !== null &&
          row.expectedLevelDelta !== undefined &&
          Number.isFinite(Number(row.expectedLevelDelta))
          ? Number(row.expectedLevelDelta)
          : null,
        region: cleanValue(league.region),
        seasonDataStatus: cleanValue(target) === 'history' ? 'historical' : 'current',
        seasonDataCompleteness: cleanValue(target) === 'history' ? 'complete' : 'partial',
        ...performance,
        points: stats.points,
        ...buildTeamSeasonSearchMetrics({
          target,
          seasonStatus: season.seasonStatus,
          leagueTotalRound: season.leagueTotalRound,
          teamGamePlayed: performance.teamGamePlayed,
          points: stats.points,
          goalsFor: performance.goalsFor,
          goalsAgainst: performance.goalsAgainst,
        }),
        teamPerformanceSchemaVersion: 5,
        ...buildLeagueScoutProjection({ league, season, scoutResult }),
        sourceCollection: 'leagues',
        sourceDocumentId: leagueId,
        sourceTarget: cleanValue(target) === 'history' ? 'history' : 'current',
      },
    }
  }).filter(Boolean)
}
