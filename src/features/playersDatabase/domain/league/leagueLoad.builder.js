// src/features/playersDatabase/domain/league/leagueLoad.builder.js

import { normalizeCompetitionRules } from '../projections/club/clubCompetition.projection.js'
import { readStatsGameCount } from '../stats/statsLoadState.js'
import {
  resolveLeagueTeamId,
} from './leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const requirePositiveInteger = (value, fieldName) => {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`Invalid ${fieldName}`)
  }

  return numberValue
}

const normalizeSeasonStatus = value => {
  const status = clean(value).toLowerCase()
  if (!['not_started', 'active', 'completed'].includes(status)) {
    throw new Error('Invalid seasonStatus')
  }

  return status
}

const normalizeOfficialTable = value => ({
  rank: toNullableNumber(value && value.rank),
  points: toNullableNumber(value && value.points),
  goalsFor: toNullableNumber(value && value.goalsFor),
  goalsAgainst: toNullableNumber(value && value.goalsAgainst),
  teamGamePlayed: toNullableNumber(value && value.teamGamePlayed),
})

const createEmptyPerformanceSide = () => ({
  targetRate: null,
  targetNormalized: null,
  targetLevel: '',
  rankingRate: null,
  rankingNormalized: null,
  rankingLevel: '',
  anomalyRate: null,
  anomalyLevel: '',
  qualityRate: null,
  scoutPriorityScore: null,
  priorityLevel: '',
  opportunityType: '',
  rank: null,
  benchmark: {
    expectedValue: null,
    actualValue: null,
    projectedValue: null,
    gap: null,
  },
})

const createEmptyPerformance = () => ({
  offense: createEmptyPerformanceSide(),
  defense: createEmptyPerformanceSide(),
})

const normalizePerformanceSide = value => {
  const source = value && typeof value === 'object' ? value : {}
  const benchmark = source.benchmark && typeof source.benchmark === 'object'
    ? source.benchmark
    : {}

  return {
    targetRate: toNullableNumber(source.targetRate),
    targetNormalized: toNullableNumber(source.targetNormalized),
    targetLevel: clean(source.targetLevel),
    rankingRate: toNullableNumber(source.rankingRate),
    rankingNormalized: toNullableNumber(source.rankingNormalized),
    rankingLevel: clean(source.rankingLevel),
    anomalyRate: toNullableNumber(source.anomalyRate),
    anomalyLevel: clean(source.anomalyLevel),
    qualityRate: toNullableNumber(source.qualityRate),
    scoutPriorityScore: toNullableNumber(source.scoutPriorityScore),
    priorityLevel: clean(source.priorityLevel),
    opportunityType: clean(source.opportunityType),
    rank: toNullableNumber(source.rank),
    benchmark: {
      expectedValue: toNullableNumber(benchmark.expectedValue),
      actualValue: toNullableNumber(benchmark.actualValue),
      projectedValue: toNullableNumber(benchmark.projectedValue),
      gap: toNullableNumber(benchmark.gap),
    },
  }
}

const normalizePerformance = value => {
  if (!value || typeof value !== 'object') return createEmptyPerformance()

  return {
    offense: normalizePerformanceSide(value.offense),
    defense: normalizePerformanceSide(value.defense),
  }
}

const normalizeRosterProjection = value => ({
  playersCount: toNullableNumber(value && value.playersCount),
  hasPlayers: Boolean(value && value.hasPlayers),
  loadedAt: value && value.loadedAt || null,
})

const normalizeStatsProjection = value => ({
  hasStats: Boolean(value && value.hasStats),
  statsComplete: Boolean(value && value.statsComplete),
  loadedAt: value && value.loadedAt || null,
  teamGamePlayedAtLoad: readStatsGameCount(value && value.teamGamePlayedAtLoad),
})

const normalizeScoutingProjection = value => ({
  ...value,
  playersWithScoutProfileCount: toNullableNumber(
    value && value.playersWithScoutProfileCount
  ),
})

const resolveClubLevel = ({ clubId, clubProfilesById, existingRow }) => {
  const clubProfile = clubProfilesById && typeof clubProfilesById === 'object'
    ? clubProfilesById[clubId]
    : null

  if (clubProfile && hasOwn(clubProfile, 'clubLevel')) {
    return toNullableNumber(clubProfile.clubLevel)
  }

  return toNullableNumber(existingRow && existingRow.clubLevel)
}

const buildTeamRow = ({
  row,
  birthYear,
  clubProfilesById,
  existingTeamsById,
  investigationByTeamId,
  performanceByTeamId,
  updatedAt,
}) => {
  const clubId = clean(row && row.clubId)
  const teamSlot = requirePositiveInteger(row && row.teamSlot, 'teamSlot')
  const teamId = resolveLeagueTeamId({ row, birthYear })

  const existingRow = existingTeamsById && typeof existingTeamsById === 'object'
    ? existingTeamsById[teamId] || null
    : null
  const suppliedPerformance = performanceByTeamId && typeof performanceByTeamId === 'object'
    ? performanceByTeamId[teamId]
    : null

  if (!suppliedPerformance) {
    throw new Error(`Missing performance projection for team ${teamId}`)
  }

  return {
    teamId,
    value: {
      clubId,
      teamSlot,
      clubLevel: resolveClubLevel({
        clubId,
        clubProfilesById,
        existingRow,
      }),
      teamUrl: clean(row && row.teamUrl),
      officialTable: normalizeOfficialTable(row && row.officialTable),
      performance: normalizePerformance(suppliedPerformance),
      roster: normalizeRosterProjection(existingRow && existingRow.roster),
      stats: normalizeStatsProjection(existingRow && existingRow.stats),
      scouting: normalizeScoutingProjection(existingRow && existingRow.scouting),
      showInvestigationIndicator: typeof investigationByTeamId?.[teamId] === 'boolean'
        ? investigationByTeamId[teamId]
        : existingRow?.showInvestigationIndicator === true,
      updatedAt: updatedAt || null,
    },
  }
}

const buildTeamsById = ({
  rows,
  birthYear,
  clubProfilesById,
  existingTeamsById,
  investigationByTeamId,
  performanceByTeamId,
  updatedAt,
}) => {
  const result = {}

  rows.forEach(row => {
    const team = buildTeamRow({
      row,
      birthYear,
      clubProfilesById,
      existingTeamsById,
      investigationByTeamId,
      performanceByTeamId,
      updatedAt,
    })

    if (Object.prototype.hasOwnProperty.call(result, team.teamId)) {
      throw new Error('Duplicate team id in league table')
    }

    result[team.teamId] = team.value
  })

  return result
}

const resolveSeasonOwnedValue = ({ supplied, existing, fallback = null }) => {
  if (supplied !== undefined && supplied !== null && supplied !== '') return supplied
  if (existing !== undefined && existing !== null && existing !== '') return existing

  return fallback
}

const resolveGameDurationMinutes = ({ existingSeason, season }) => {
  const existingValue = toNullableNumber(existingSeason && existingSeason.gameDurationMinutes)
  if (existingValue !== null) return existingValue
  return toNullableNumber(season && season.gameDurationMinutes)
}

const normalizePerformanceCalculation = value => {
  const source = value && typeof value === 'object' ? value : {}

  return {
    engineVersion: clean(source.engineVersion),
    normalizationMode: clean(source.normalizationMode),
    appliedFactor: toNullableNumber(source.appliedFactor),
    calculatedAt: source.calculatedAt || null,
  }
}

export const buildLeagueLoadDocument = ({
  context = {},
  season = {},
  clubProfilesById = {},
  performanceByTeamId = {},
  investigationByTeamId = {},
  performanceCalculation = {},
  createdAt = null,
  updatedAt = null,
  tableImportedAt = null,
  tableState = '',
} = {}) => {
  const leagueId = clean(context.leagueId)
  const seasonId = clean(context.seasonId)
  const birthYear = requirePositiveInteger(context.birthYear, 'birthYear')
  const rows = Array.isArray(context.canonicalRows) ? context.canonicalRows : []
  const normalizedIdentity = context.normalizedLeagueIdentity && typeof context.normalizedLeagueIdentity === 'object'
    ? context.normalizedLeagueIdentity
    : {}
  const resolvedLeagueTotalRound = toNullableNumber(context.resolvedLeagueTotalRound)
  const seasonKey = clean(season.seasonKey)
  const resolvedTableState = clean(tableState) || (
    rows.length > 0 ? 'LOADED' : 'LOADED_EMPTY'
  )

  if (!leagueId) throw new Error('Missing resolved leagueId')
  if (!seasonId) throw new Error('Missing resolved seasonId')
  if (!resolvedLeagueTotalRound && rows.length > 1) {
    throw new Error('Missing resolvedLeagueTotalRound')
  }

  if (!seasonKey) throw new Error('Missing seasonKey')
  if (!['NOT_LOADED', 'LOADED_EMPTY', 'LOADED'].includes(resolvedTableState)) {
    throw new Error('Invalid tableState')
  }
  if (resolvedTableState === 'NOT_LOADED' && rows.length > 0) {
    throw new Error('NOT_LOADED League season cannot contain teams')
  }
  if (resolvedTableState !== 'NOT_LOADED' && !tableImportedAt) {
    throw new Error('Missing tableImportedAt')
  }
  if (rows.length > 0 && !clean(performanceCalculation.engineVersion)) {
    throw new Error('Missing performanceCalculation.engineVersion')
  }

  const existingSeasonsById = context.existingSeasonsById && typeof context.existingSeasonsById === 'object'
    ? context.existingSeasonsById
    : {}
  const existingSeason = context.existingSeason && typeof context.existingSeason === 'object'
    ? context.existingSeason
    : {}
  const existingTimestamps = context.existingTimestamps &&
    typeof context.existingTimestamps === 'object'
    ? context.existingTimestamps
    : {}
  const existingTable = existingSeason.table && typeof existingSeason.table === 'object'
    ? existingSeason.table
    : {}
  const existingTeamsById = existingTable.teamsById && typeof existingTable.teamsById === 'object'
    ? existingTable.teamsById
    : {}
  const teamsById = buildTeamsById({
    rows,
    birthYear,
    clubProfilesById,
    existingTeamsById,
    investigationByTeamId,
    performanceByTeamId,
    updatedAt,
  })
  const suppliedRules = season.competitionRules && typeof season.competitionRules === 'object'
    ? season.competitionRules
    : null
  const existingRules = existingSeason.competitionRules &&
    typeof existingSeason.competitionRules === 'object'
    ? existingSeason.competitionRules
    : {}
  const nextSeason = {
    seasonKey,
    seasonStatus: normalizeSeasonStatus(season.seasonStatus),
    birthYear,
    seasonUrl: clean(resolveSeasonOwnedValue({
      supplied: season.seasonUrl,
      existing: existingSeason.seasonUrl,
      fallback: '',
    })),
    leagueTotalRound: resolvedLeagueTotalRound,
    gameDurationMinutes: resolveGameDurationMinutes({
      existingSeason,
      season,
    }),
    tableImportedAt,
    competitionRules: normalizeCompetitionRules(suppliedRules || existingRules),
    table: {
      tableState: resolvedTableState,
      teamsById,
    },
    performanceCalculation: normalizePerformanceCalculation(performanceCalculation),
    updatedAt: updatedAt || null,
  }

  return {
    leagueId,
    seasonId,
    document: {
      leagueId,
      names: normalizedIdentity.names || {},
      region: clean(normalizedIdentity.region),
      ageGroupId: clean(normalizedIdentity.ageGroupId),
      ageGroupLabel: clean(normalizedIdentity.ageGroupLabel),
      level: toNullableNumber(normalizedIdentity.level),
      seasonsById: {
        ...existingSeasonsById,
        [seasonId]: nextSeason,
      },
      timestamps: {
        createdAt: existingTimestamps.createdAt || createdAt || null,
        updatedAt: updatedAt || null,
      },
    },
    season: nextSeason,
  }
}
