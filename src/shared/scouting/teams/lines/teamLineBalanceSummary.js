// src/shared/scouting/teams/lines/teamLineBalanceSummary.js

import { TEAM_BALANCE_USAGE_THRESHOLDS } from '../balance/teamBalance.model.js'
import { TEAM_PLAYER_LINE } from './teamLineClassification.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

const roundRate = value => (
  Number.isFinite(Number(value))
    ? Number(Number(value).toFixed(4))
    : null
)

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const isOperationalPlayer = player => (
  player &&
  typeof player === 'object' &&
  clean(player.rosterStatus) !== 'retired'
)

const isLoadedPlayer = player => clean(player?.statsStatus) === 'loaded'

const readKnownValues = ({ players = [], key }) => players
  .map(player => toKnownNonNegativeNumber(getPlayerStats(player)[key]))
  .filter(value => value !== null)

const sumValues = values => values.reduce((sum, value) => sum + value, 0)

const buildTopShare = ({ values = [], count = 1 }) => {
  const total = sumValues(values)
  if (total <= 0 || values.length <= 0) return null

  const topTotal = [...values]
    .sort((left, right) => right - left)
    .slice(0, count)
    .reduce((sum, value) => sum + value, 0)

  return roundRate(topTotal / total)
}

const buildUsageThresholdCounts = ({ players = [] } = {}) => TEAM_BALANCE_USAGE_THRESHOLDS.reduce(
  (result, threshold) => ({
    ...result,
    [String(Math.round(threshold * 100))]: players.filter(player => {
      const stats = getPlayerStats(player)
      const minutes = toKnownNonNegativeNumber(stats.minutes)
      const teamMinutes = toKnownNonNegativeNumber(stats.teamMinutes)

      if (minutes === null || teamMinutes === null || teamMinutes <= 0) return false

      return (minutes / teamMinutes) >= threshold
    }).length,
  }),
  {}
)

const buildLineSummary = ({ players = [], classifiedTotals = {} } = {}) => {
  const loadedPlayers = players.filter(isLoadedPlayer)
  const minutes = readKnownValues({ players: loadedPlayers, key: 'minutes' })
  const starts = readKnownValues({ players: loadedPlayers, key: 'starts' })
  const substituteIn = readKnownValues({ players: loadedPlayers, key: 'substituteIn' })
  const substitutedOut = readKnownValues({ players: loadedPlayers, key: 'substitutedOut' })
  const goals = readKnownValues({ players: loadedPlayers, key: 'goals' })
  const minutesTotal = sumValues(minutes)
  const startsTotal = sumValues(starts)
  const substituteInTotal = sumValues(substituteIn)
  const substitutedOutTotal = sumValues(substitutedOut)
  const goalsTotal = sumValues(goals)

  return {
    playersCount: players.length,
    loadedPlayersCount: loadedPlayers.length,
    minutesTotal,
    classifiedMinutesShare: classifiedTotals.minutes > 0
      ? roundRate(minutesTotal / classifiedTotals.minutes)
      : 0,
    minutesTop1Share: buildTopShare({ values: minutes, count: 1 }),
    minutesTop3Share: buildTopShare({ values: minutes, count: 3 }),
    possibleMinutesUsageCounts: buildUsageThresholdCounts({ players: loadedPlayers }),
    startsTotal,
    classifiedStartsShare: classifiedTotals.starts > 0
      ? roundRate(startsTotal / classifiedTotals.starts)
      : 0,
    startsTop3Share: buildTopShare({ values: starts, count: 3 }),
    substituteInTotal,
    substitutedOutTotal,
    goalsTotal,
    classifiedGoalsShare: classifiedTotals.goals > 0
      ? roundRate(goalsTotal / classifiedTotals.goals)
      : 0,
    goalsTop1Share: buildTopShare({ values: goals, count: 1 }),
    uniqueScorers: goals.filter(value => value > 0).length,
    scorers3Plus: goals.filter(value => value >= 3).length,
    scorers5Plus: goals.filter(value => value >= 5).length,
  }
}

export const buildTeamLineBalanceSummary = ({ players = [] } = {}) => {
  const classifiedPlayers = (Array.isArray(players) ? players : [])
    .filter(isOperationalPlayer)
    .filter(player => Object.values(TEAM_PLAYER_LINE).includes(
      clean(player?.lineClassification?.line)
    ))
  const loadedClassifiedPlayers = classifiedPlayers.filter(isLoadedPlayer)
  const classifiedTotals = {
    minutes: sumValues(readKnownValues({ players: loadedClassifiedPlayers, key: 'minutes' })),
    starts: sumValues(readKnownValues({ players: loadedClassifiedPlayers, key: 'starts' })),
    goals: sumValues(readKnownValues({ players: loadedClassifiedPlayers, key: 'goals' })),
  }
  const playersByLine = Object.values(TEAM_PLAYER_LINE).reduce((result, line) => ({
    ...result,
    [line]: classifiedPlayers.filter(player => (
      clean(player?.lineClassification?.line) === line
    )),
  }), {})

  return {
    defense: buildLineSummary({
      players: playersByLine[TEAM_PLAYER_LINE.DEFENSE],
      classifiedTotals,
    }),
    midfield: buildLineSummary({
      players: playersByLine[TEAM_PLAYER_LINE.MIDFIELD],
      classifiedTotals,
    }),
    attack: buildLineSummary({
      players: playersByLine[TEAM_PLAYER_LINE.ATTACK],
      classifiedTotals,
    }),
  }
}
