// src/shared/scouting/teams/balance/teamBalance.productionDistribution.js

import {
  TEAM_BALANCE_AVAILABILITY,
  TEAM_BALANCE_STATS_STATUS,
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

const sumTop = (values, count) => (
  values.slice(0, count).reduce((sum, value) => sum + value, 0)
)

export const buildTeamBalanceProductionDistribution = ({
  players = [],
  reliability = {},
} = {}) => {
  const loadedPlayers = (Array.isArray(players) ? players : []).filter(isEligiblePlayer)
  const knownGoalRows = loadedPlayers.map(player => {
    const goals = toKnownNonNegativeNumber(getPlayerStats(player).goals)
    if (goals === null) return null
    return goals
  }).filter(value => value !== null)
  const totalGoals = knownGoalRows.reduce((sum, goals) => sum + goals, 0)
  const sortedGoals = [...knownGoalRows].sort((a, b) => b - a)
  const scorers = sortedGoals.filter(goals => goals > 0)
  const knownGoalsCount = knownGoalRows.length
  const unknownGoalsCount = Math.max(loadedPlayers.length - knownGoalsCount, 0)
  const goalsKnownCoverage = loadedPlayers.length > 0
    ? roundRate(knownGoalsCount / loadedPlayers.length)
    : 0
  const generalReliability = reliability?.reliability || 'insufficient'
  const availability = (
    knownGoalsCount === 0 ||
    generalReliability === 'insufficient'
  )
    ? TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
    : (
        generalReliability === 'partial' ||
        knownGoalsCount < loadedPlayers.length
      )
      ? TEAM_BALANCE_AVAILABILITY.LIMITED
      : TEAM_BALANCE_AVAILABILITY.AVAILABLE

  return {
    family: 'productionDistribution',
    availability,
    knownCount: knownGoalsCount,
    unknownCount: unknownGoalsCount,
    coverage: goalsKnownCoverage,
    goalsKnownCoverage,
    knownGoalsCount,
    unknownGoalsCount,
    rosterKnownCoverage: roundRate(reliability?.loadedCoverage || 0),
    totalGoals,
    concentration: {
      top1Share: totalGoals > 0 ? roundRate(sumTop(sortedGoals, 1) / totalGoals) : null,
      top3Share: totalGoals > 0 ? roundRate(sumTop(sortedGoals, 3) / totalGoals) : null,
    },
    breadth: {
      uniqueScorers: scorers.length,
      scorers3Plus: scorers.filter(goals => goals >= 3).length,
      scorers5Plus: scorers.filter(goals => goals >= 5).length,
    },
  }
}
