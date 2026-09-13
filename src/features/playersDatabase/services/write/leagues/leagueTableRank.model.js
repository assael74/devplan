import { pickDefinedValue } from '../../../model/shared/value.model.js'
import { normalizeTeamIdentity } from '../../../model/team/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../model/team/teamStats.model.js'
import {
  clean,
  toNumberOrZero,
} from './leagueDoc.js'
import { updateHistorySeason } from './leagueSeason.js'
import { normalizeTeamTaskSignals } from '../../../domain/projections/teamScoutSummary.projection.js'
import { areComparableValuesEqual } from '../../shared/valueComparison.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

export const buildTableRank = ({ rows = [], existingTableRank = [] } = {}) => {
  const findExistingTableRankRow = row => {
    const identity = normalizeTeamIdentity({ team: row })
    const teamId = clean(identity.birthTeamId)
    const clubId = clean(identity.clubId)

    return (Array.isArray(existingTableRank) ? existingTableRank : []).find(existingRow => {
      const existingIdentity = normalizeTeamIdentity({ team: existingRow })
      const existingTeamId = clean(existingIdentity.birthTeamId)
      const existingClubId = clean(existingIdentity.clubId)

      if (teamId && existingTeamId) return teamId === existingTeamId
      return !teamId && clubId && existingClubId === clubId
    }) || null
  }

  const buildTableRankRow = row => {
    const existingRow = findExistingTableRankRow(row)
    const rank = toNumberOrZero(pickDefinedValue(row.position, row.rank, row.leaguePosition))
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
      clubLevel: toNumberOrZero(pickDefinedValue(row.clubLevel, existingRow?.clubLevel)),
      birthTeamId: identity.birthTeamId,
      birthTeamSlot: identity.birthTeamSlot,
      teamId: identity.birthTeamId,
      teamUrl: clean(row.teamUrl) || clean(existingRow?.teamUrl),
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
      updatedAt: new Date().toISOString(),
    }
  }

  return (Array.isArray(rows) ? rows : [])
    .map(buildTableRankRow)
    .filter(row => row.rank || row.clubId || row.birthTeamId || row.teamId)
}

export const isSameLeagueSeasonPersistedState = (currentSeason, nextSeason) => (
  areComparableValuesEqual(currentSeason || null, nextSeason || null, {
    omitKeys: ['updatedAt'],
  })
)

export const updateHistorySeasonTableRank = ({
  history = [],
  season = {},
  tableRank = [],
  teamPerformanceContext = {},
} = {}) => (
  updateHistorySeason({
    history,
    season,
    patch: {
      birthYear: toNumberOrZero(season.birthYear),
      leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
      competitionRules: season?.competitionRules || {},
      seasonStatus: 'completed',
      tableRank,
      teamPerformanceContext,
      updatedAt: new Date().toISOString(),
    },
  })
)

export const hasFiniteNumberValue = value => clean(value) !== '' && Number.isFinite(Number(value))

export const sumTableRankPlayersCount = tableRank => (
  (Array.isArray(tableRank) ? tableRank : []).reduce(
    (total, row) => total + toNumberOrZero(row?.playersCount),
    0
  )
)

export const hasTableRankPlayersCount = tableRank => (
  (Array.isArray(tableRank) ? tableRank : []).some(row => hasFiniteNumberValue(row?.playersCount))
)

export const updateTableRankRowScoutProfilesSummary = ({
  tableRank = [],
  team = {},
  scoutProfilesSummary = {},
  teamTaskSignals = null,
} = {}) => {
  const teamId = normalizeTeamIdentity({ team }).birthTeamId
  const clubId = clean(team.clubId)
  const hasTeamTaskSignals = Boolean(teamTaskSignals && typeof teamTaskSignals === 'object')
  const normalizedTaskSignals = normalizeTeamTaskSignals(teamTaskSignals)

  return (Array.isArray(tableRank) ? tableRank : []).map(row => {
    const rowTeamId = normalizeTeamIdentity({ team: row }).birthTeamId
    const rowClubId = clean(row.clubId)
    const sameTeam = teamId && rowTeamId === teamId
    const sameClubFallback = !teamId && clubId && rowClubId === clubId

    if (!sameTeam && !sameClubFallback) return row

    return {
      ...row,
      scoutProfilesSummary: {
        total: toNumberOrZero(scoutProfilesSummary.total),
        profileCounts: scoutProfilesSummary.profileCounts || {},
      },
      ...(hasTeamTaskSignals
        ? {
            teamTaskSignals: {
              ...normalizedTaskSignals,
              updatedAt: new Date().toISOString(),
            },
          }
        : {}),
      updatedAt: new Date().toISOString(),
    }
  })
}

export const applyScoutProfilesSummaries = ({ tableRank = [], summaries = [] } = {}) => (
  (Array.isArray(summaries) ? summaries : []).reduce(
    (nextTableRank, item) => updateTableRankRowScoutProfilesSummary({
      tableRank: nextTableRank,
      team: item?.team || {},
      scoutProfilesSummary: item?.scoutProfilesSummary || {},
    }),
    Array.isArray(tableRank) ? tableRank : []
  )
)
