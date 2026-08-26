// src/shared/scouting/teams/balance/teamBalance.minutesDistribution.js

import {
  TEAM_BALANCE_AVAILABILITY,
  TEAM_BALANCE_STATS_STATUS,
  TEAM_BALANCE_TOP_PLAYER_COUNTS,
  TEAM_BALANCE_USAGE_THRESHOLDS,
} from './teamBalance.model.js'

const clean = value => String(value || '').trim()

const roundRate = value => (
  Number.isFinite(Number(value))
    ? Number(Number(value).toFixed(4))
    : null
)

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const isEligiblePlayer = player => (
  player &&
  typeof player === 'object' &&
  !['retired', 'transferredOut'].includes(clean(player.rosterStatus)) &&
  clean(player.statsStatus) === TEAM_BALANCE_STATS_STATUS.LOADED
)

const buildTopShare = ({ sortedMinutes = [], totalMinutes = 0, count }) => {
  const actualCount = Math.min(sortedMinutes.length, count)

  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return {
      count,
      actualCount,
      isCompleteRosterSlice: sortedMinutes.length >= count,
      hasFullTopN: sortedMinutes.length >= count,
      coversAllKnownPlayers: sortedMinutes.length <= count,
      minutes: 0,
      share: null,
    }
  }

  const minutes = sortedMinutes
    .slice(0, count)
    .reduce((sum, value) => sum + value, 0)

  return {
    count,
    actualCount,
    isCompleteRosterSlice: sortedMinutes.length >= count,
    hasFullTopN: sortedMinutes.length >= count,
    coversAllKnownPlayers: sortedMinutes.length <= count,
    minutes,
    share: roundRate(minutes / totalMinutes),
  }
}

const buildPossibleMinutesUsage = ({ players = [], availability, reliability = {} }) => {
  const rows = players.map(player => {
    const stats = getPlayerStats(player)
    const minutes = toKnownNonNegativeNumber(stats.minutes)
    const teamMinutes = toKnownNonNegativeNumber(stats.teamMinutes)

    if (minutes === null || teamMinutes === null || teamMinutes <= 0) {
      return null
    }

    return {
      playerId: clean(player.playerId || player.externalPlayerId || player.identityKey),
      minutes,
      teamMinutes,
      usageRate: roundRate(minutes / teamMinutes),
    }
  }).filter(Boolean)

  const thresholdCounts = TEAM_BALANCE_USAGE_THRESHOLDS.reduce((result, threshold) => ({
    ...result,
    [String(Math.round(threshold * 100))]: rows.filter(row => row.usageRate >= threshold).length,
  }), {})

  return {
    availability,
    knownCount: rows.length,
    unknownCount: Math.max(players.length - rows.length, 0),
    coverage: players.length > 0 ? roundRate(rows.length / players.length) : 0,
    rosterKnownCoverage: roundRate(reliability?.loadedCoverage || 0),
    teamMinutesConsistent: reliability?.teamMinutesConsistent !== false,
    teamMinutesValuesCount: Number(reliability?.teamMinutesValuesCount || 0),
    teamMinutesRange: reliability?.teamMinutesRange || null,
    thresholdCounts,
  }
}

export const buildTeamBalanceMinutesDistribution = ({
  players = [],
  reliability = {},
} = {}) => {
  const loadedPlayers = (Array.isArray(players) ? players : []).filter(isEligiblePlayer)
  const knownMinuteRows = loadedPlayers.map(player => {
    const stats = getPlayerStats(player)
    const minutes = toKnownNonNegativeNumber(stats.minutes)

    if (minutes === null) return null

    return {
      player,
      minutes,
    }
  }).filter(Boolean)
  const totalMinutes = knownMinuteRows.reduce((sum, row) => sum + row.minutes, 0)
  const sortedMinutes = knownMinuteRows
    .map(row => row.minutes)
    .sort((a, b) => b - a)
  const topShares = TEAM_BALANCE_TOP_PLAYER_COUNTS.reduce((result, count) => ({
    ...result,
    [String(count)]: buildTopShare({
      sortedMinutes,
      totalMinutes,
      count,
    }),
  }), {})
  const distributionAvailability = reliability?.availability?.minutesDistribution ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  const possibleMinutesAvailability = reliability?.availability?.possibleMinutesUsage ||
    TEAM_BALANCE_AVAILABILITY.UNAVAILABLE

  return {
    family: 'minutesDistribution',
    availability: distributionAvailability,
    knownCount: knownMinuteRows.length,
    unknownCount: Math.max(loadedPlayers.length - knownMinuteRows.length, 0),
    coverage: loadedPlayers.length > 0
      ? roundRate(knownMinuteRows.length / loadedPlayers.length)
      : 0,
    rosterKnownCoverage: roundRate(reliability?.loadedCoverage || 0),
    totalMinutes,
    topShares,
    possibleMinutesUsage: buildPossibleMinutesUsage({
      players: loadedPlayers,
      availability: possibleMinutesAvailability,
      reliability,
    }),
  }
}
