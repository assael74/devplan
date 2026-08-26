// src/shared/scouting/teams/balance/teamBalance.rotationDistribution.js

import {
  TEAM_BALANCE_AVAILABILITY,
  TEAM_BALANCE_STATS_STATUS,
  TEAM_BALANCE_TOP_PLAYER_COUNTS,
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

const buildAvailability = ({
  knownCount,
  playerCount,
  reliability,
}) => {
  if (knownCount <= 0 || playerCount <= 0) {
    return TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  }

  if (
    reliability?.reliability === 'insufficient' ||
    knownCount < playerCount ||
    reliability?.reliability === 'partial'
  ) {
    return TEAM_BALANCE_AVAILABILITY.LIMITED
  }

  return TEAM_BALANCE_AVAILABILITY.AVAILABLE
}

const combineAvailability = values => {
  if (values.includes(TEAM_BALANCE_AVAILABILITY.UNAVAILABLE)) {
    return TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  }

  if (values.includes(TEAM_BALANCE_AVAILABILITY.LIMITED)) {
    return TEAM_BALANCE_AVAILABILITY.LIMITED
  }

  return TEAM_BALANCE_AVAILABILITY.AVAILABLE
}

const buildTopShares = ({ values = [] }) => {
  const total = values.reduce((sum, value) => sum + value, 0)
  const sorted = [...values].sort((a, b) => b - a)

  return TEAM_BALANCE_TOP_PLAYER_COUNTS.reduce((result, count) => {
    const actualCount = Math.min(sorted.length, count)
    const amount = sorted.slice(0, count).reduce((sum, value) => sum + value, 0)

    return {
      ...result,
      [String(count)]: {
        count,
        actualCount,
        hasFullTopN: sorted.length >= count,
        coversAllKnownPlayers: sorted.length <= count,
        amount,
        share: total > 0 ? roundRate(amount / total) : null,
      },
    }
  }, {})
}

const buildKnownMetric = ({
  players = [],
  field,
  reliability,
}) => {
  const values = players.map(player => (
    toKnownNonNegativeNumber(getPlayerStats(player)[field])
  ))
  const knownValues = values.filter(value => value !== null)
  const knownCount = knownValues.length
  const unknownCount = Math.max(players.length - knownCount, 0)

  return {
    availability: buildAvailability({
      knownCount,
      playerCount: players.length,
      reliability,
    }),
    knownCount,
    unknownCount,
    coverage: players.length > 0
      ? roundRate(knownCount / players.length)
      : 0,
    total: knownValues.reduce((sum, value) => sum + value, 0),
    activePlayersCount: knownValues.filter(value => value > 0).length,
    topShares: buildTopShares({
      values: knownValues,
    }),
  }
}

export const buildTeamBalanceRotationDistribution = ({
  players = [],
  reliability = {},
} = {}) => {
  const loadedPlayers = (Array.isArray(players) ? players : []).filter(isEligiblePlayer)
  const starts = buildKnownMetric({
    players: loadedPlayers,
    field: 'starts',
    reliability,
  })
  const substituteIn = buildKnownMetric({
    players: loadedPlayers,
    field: 'substituteIn',
    reliability,
  })

  const roleRows = loadedPlayers.map(player => {
    const stats = getPlayerStats(player)
    const startsValue = toKnownNonNegativeNumber(stats.starts)
    const substituteInValue = toKnownNonNegativeNumber(stats.substituteIn)

    if (startsValue === null || substituteInValue === null) return null

    return {
      starts: startsValue,
      substituteIn: substituteInValue,
    }
  }).filter(Boolean)

  const usageTypesKnownCount = roleRows.length
  const usageTypesUnknownCount = Math.max(
    loadedPlayers.length - usageTypesKnownCount,
    0
  )
  const usageTypesCoverage = loadedPlayers.length > 0
    ? roundRate(usageTypesKnownCount / loadedPlayers.length)
    : 0
  const usageTypesAvailability = buildAvailability({
    knownCount: usageTypesKnownCount,
    playerCount: loadedPlayers.length,
    reliability,
  })
  const availability = combineAvailability([
    starts.availability,
    substituteIn.availability,
    usageTypesAvailability,
  ])

  return {
    family: 'rotationDistribution',
    availability,
    rosterKnownCoverage: roundRate(reliability?.loadedCoverage || 0),
    starts,
    substituteIn,
    usageTypes: {
      availability: usageTypesAvailability,
      knownCount: usageTypesKnownCount,
      unknownCount: usageTypesUnknownCount,
      coverage: usageTypesCoverage,
      startersOnlyCount: roleRows.filter(row => (
        row.starts > 0 && row.substituteIn === 0
      )).length,
      substitutesOnlyCount: roleRows.filter(row => (
        row.starts === 0 && row.substituteIn > 0
      )).length,
      mixedUsageCount: roleRows.filter(row => (
        row.starts > 0 && row.substituteIn > 0
      )).length,
      noStartOrSubCount: roleRows.filter(row => (
        row.starts === 0 && row.substituteIn === 0
      )).length,
    },
  }
}
