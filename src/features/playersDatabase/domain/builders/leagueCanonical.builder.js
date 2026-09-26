import { normalizeTeamTaskSignals } from '../projections/teamScoutSummary.projection.js'
import { normalizeCompetitionRules } from '../projections/club/clubCompetition.projection.js'
import { resolveLeagueScheduleProjection } from '../projections/leagueSchedule.projection.js'
import { normalizeTeamIdentity } from '../../model/team/teamIdentity.model.js'
import { normalizeTeamStats } from '../../model/team/teamStats.model.js'
import {
  buildSeasonKey,
  isSameSeason,
  normalizeSeasonIdentity,
  normalizeSeasonStatus,
} from '../../model/shared/season.model.js'
import {
  cleanValue,
  pickDefinedValue,
  toNumberOrZero,
} from '../../model/shared/value.model.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const normalizeLeagueLevel = value => {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

const normalizeSeasonTableRank = value => {
  if (value === null || value === undefined) return null

  return Array.isArray(value) ? value : null
}

const cleanTeamStatsComputedFields = (teamStats = {}) => {
  const {
    attackPerformance,
    defensePerformance,
    attackNormalPerformance,
    defenseNormalPerformance,
    scoutPerformance,
    ...cleanTeamStats
  } = teamStats || {}

  return cleanTeamStats
}

const cleanTableRankComputedFields = tableRank => {
  if (tableRank === null || tableRank === undefined) return null
  if (!Array.isArray(tableRank)) return tableRank

  return tableRank.map(row => ({
    ...row,
    teamStats: cleanTeamStatsComputedFields(row?.teamStats),
  }))
}

export const cleanLeagueSeasonComputedFields = (season = {}) => {
  const {
    goalsEnvironment,
    scoutEnvironment,
    teamsCount,
    tableRankCount,
    playersCount,
    playersWithScoutProfileCount,
    scoutProfilesCount,
    ...cleanSeason
  } = season || {}

  return {
    ...cleanSeason,
    tableRank: cleanTableRankComputedFields(season?.tableRank),
  }
}

const hasLeagueSeasonIdentity = season => Boolean(
  cleanValue(season?.seasonId) || cleanValue(season?.seasonKey)
)

export const buildLeagueCanonicalRoot = ({
  league = {},
  currentData = {},
  createdAt,
  updatedAt,
} = {}) => ({
  id: cleanValue(league.id),
  leagueId: cleanValue(league.id),
  leagueName: cleanValue(league.name || currentData.leagueName),
  region: cleanValue(league.region || currentData.region),
  ageGroupId: cleanValue(league.ageGroupId || currentData.ageGroupId),
  ageGroupLabel: cleanValue(league.ageGroupLabel || currentData.ageGroupLabel),
  level: normalizeLeagueLevel(
    pickDefinedValue(league.level, currentData.level, null)
  ),
  current: hasLeagueSeasonIdentity(currentData.current)
    ? cleanLeagueSeasonComputedFields(currentData.current)
    : null,
  history: Array.isArray(currentData.history)
    ? currentData.history.map(cleanLeagueSeasonComputedFields)
    : [],
  createdAt: currentData.createdAt || createdAt,
  updatedAt,
})

export const buildLeagueCanonicalSeason = (season = {}) => {
  const seasonId = cleanValue(season.seasonId)
  const seasonKey = cleanValue(season.seasonKey) || buildSeasonKey(seasonId)

  return {
    seasonId,
    seasonKey,
    seasonUrl: cleanValue(season.seasonUrl),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    seasonStatus: normalizeSeasonStatus(
      season.seasonStatus,
      cleanValue(season.seasonStatus) === 'completed'
        ? 'completed'
        : 'active'
    ),
    tableRank: normalizeSeasonTableRank(season.tableRank),
    updatedAt: season.updatedAt,
  }
}

const findExistingTableRankRow = ({ row = {}, existingTableRank = [] } = {}) => {
  const identity = normalizeTeamIdentity({ team: row })
  const teamId = cleanValue(identity.birthTeamId)
  const clubId = cleanValue(identity.clubId)

  return (Array.isArray(existingTableRank) ? existingTableRank : []).find(existingRow => {
    const existingIdentity = normalizeTeamIdentity({ team: existingRow })
    const existingTeamId = cleanValue(existingIdentity.birthTeamId)
    const existingClubId = cleanValue(existingIdentity.clubId)

    if (teamId && existingTeamId) return teamId === existingTeamId

    return !teamId && clubId && existingClubId === clubId
  }) || null
}

export const buildLeagueCanonicalTableRank = ({
  rows = [],
  existingTableRank = [],
  updatedAt,
} = {}) => (
  (Array.isArray(rows) ? rows : [])
    .map(row => {
      const existingRow = findExistingTableRankRow({
        row,
        existingTableRank,
      })
      const rank = toNumberOrZero(
        pickDefinedValue(row.position, row.rank, row.leaguePosition)
      )
      const identity = normalizeTeamIdentity({ team: row })
      const teamStats = normalizeTeamStats(row, {
        gamesCandidates: [row.games],
        goalsForCandidates: [row.goalsFor],
        goalsAgainstCandidates: [row.goalsAgainst],
        pointsCandidates: [row.points],
      })
      const existingPlayersCount = hasOwn(existingRow, 'playersCount')
        ? toNumberOrZero(existingRow.playersCount)
        : 0

      return {
        rank,
        clubId: identity.clubId,
        clubLevel: toNumberOrZero(
          pickDefinedValue(row.clubLevel, existingRow?.clubLevel)
        ),
        birthTeamId: identity.birthTeamId,
        birthTeamSlot: identity.birthTeamSlot,
        teamId: identity.birthTeamId,
        teamUrl: cleanValue(row.teamUrl) || cleanValue(existingRow?.teamUrl),
        playersCount: existingPlayersCount,
        hasPlayers: hasOwn(existingRow, 'hasPlayers')
          ? Boolean(existingRow.hasPlayers)
          : existingPlayersCount > 0,
        hasStats: hasOwn(existingRow, 'hasStats')
          ? Boolean(existingRow.hasStats)
          : false,
        statsComplete: hasOwn(existingRow, 'statsComplete')
          ? Boolean(existingRow.statsComplete)
          : false,
        teamStats: {
          ...(existingRow?.teamStats || {}),
          points: teamStats.points,
          goalsFor: teamStats.goalsFor,
          goalsAgainst: teamStats.goalsAgainst,
          teamGamePlayed: teamStats.gamesPlayed,
        },
        scoutProfilesSummary: {
          total: toNumberOrZero(existingRow?.scoutProfilesSummary?.total),
          profileCounts: existingRow?.scoutProfilesSummary?.profileCounts || {},
        },
        teamTaskSignals: normalizeTeamTaskSignals(existingRow?.teamTaskSignals),
        updatedAt,
      }
    })
    .filter(row => row.rank || row.clubId || row.birthTeamId || row.teamId)
)

export const findLeagueCanonicalSeason = ({
  history = [],
  season = {},
} = {}) => (
  (Array.isArray(history) ? history : []).find(item => (
    isSameSeason(item, season)
  )) || null
)

const upsertHistorySeason = ({ history = [], season = {} } = {}) => {
  const safeHistory = Array.isArray(history) ? history : []
  const seasonIndex = safeHistory.findIndex(item => isSameSeason(item, season))

  if (seasonIndex === -1) return [...safeHistory, season]

  return safeHistory.map((item, index) => (
    index === seasonIndex
      ? {
          ...item,
          ...season,
        }
      : item
  ))
}

export const buildLeagueCanonicalState = ({
  league = {},
  season = {},
  target = 'current',
  rows = [],
  currentData = {},
  teamPerformanceContext = {},
  createdAt,
  updatedAt,
} = {}) => {
  const leagueId = cleanValue(league.id || league.leagueId || season.leagueId)
  const seasonId = cleanValue(season.seasonId)

  if (!leagueId) throw new Error('Missing league id')
  if (!seasonId) throw new Error('Missing season id')

  const baseDoc = buildLeagueCanonicalRoot({
    league: {
      ...league,
      id: leagueId,
    },
    currentData,
    createdAt,
    updatedAt,
  })
  const seasonIdentity = normalizeSeasonIdentity({
    season: {
      ...season,
      seasonId,
    },
  })
  const isHistory = (
    cleanValue(target) === 'history' ||
    normalizeSeasonStatus(season.seasonStatus) === 'completed'
  )
  const currentMatchesSeason = isSameSeason(baseDoc.current, seasonIdentity)
  const existingSeason = isHistory
    ? (
        findLeagueCanonicalSeason({
          history: baseDoc.history,
          season: seasonIdentity,
        }) ||
        (currentMatchesSeason ? baseDoc.current : null)
      )
    : currentMatchesSeason
      ? baseDoc.current
      : null
  const tableRank = buildLeagueCanonicalTableRank({
    rows,
    existingTableRank: existingSeason?.tableRank || [],
    updatedAt,
  })
  const schedule = resolveLeagueScheduleProjection({
    teamsCount: tableRank.length,
    leagueTotalRound: (
      toNumberOrZero(existingSeason?.leagueTotalRound) ||
      toNumberOrZero(season.leagueTotalRound)
    ),
  })
  const competitionRules = normalizeCompetitionRules(
    season?.competitionRules ||
    existingSeason?.competitionRules ||
    {}
  )
  const nextSeason = {
    ...cleanLeagueSeasonComputedFields(
      existingSeason ||
      buildLeagueCanonicalSeason({
        ...season,
        seasonId,
        seasonKey: seasonIdentity.seasonKey,
        updatedAt,
      })
    ),
    seasonId,
    seasonKey: seasonIdentity.seasonKey,
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: schedule.leagueTotalRound,
    competitionRules,
    seasonStatus: isHistory
      ? 'completed'
      : normalizeSeasonStatus(
          season.seasonStatus,
          cleanValue(season.seasonStatus) === 'completed'
            ? 'completed'
            : 'active'
        ),
    tableRank,
    teamPerformanceContext,
    updatedAt,
  }
  const nextData = isHistory
    ? {
        ...baseDoc,
        current: currentMatchesSeason ? null : baseDoc.current,
        history: upsertHistorySeason({
          history: baseDoc.history,
          season: nextSeason,
        }),
      }
    : {
        ...baseDoc,
        current: nextSeason,
      }

  return {
    leagueId,
    seasonId,
    seasonKey: seasonIdentity.seasonKey,
    target: isHistory ? 'history' : 'current',
    existingSeason,
    tableRank,
    schedule,
    competitionRules,
    nextData,
    canonicalSeason: nextSeason,
  }
}
