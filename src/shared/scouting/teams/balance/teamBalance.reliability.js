// src/shared/scouting/teams/balance/teamBalance.reliability.js

import {
  TEAM_BALANCE_AVAILABILITY,
  TEAM_BALANCE_RELIABILITY,
  TEAM_BALANCE_STATS_STATUS,
} from './teamBalance.model.js'

const clean = value => String(value || '').trim()

const toKnownNonNegativeNumber = value => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return null

  return number
}

// Balance persistence describes the season's observed participation. A player
// who left mid-season still consumed minutes and belongs in historical minutes,
// rotation, and production measures. Current-roster depth must be derived by
// its own current-relevant-roster selector, not by removing this evidence.
const isOperationalRosterPlayer = player => ![
  'retired',
].includes(clean(player?.rosterStatus))

const isStatsLoaded = player => (
  clean(player?.statsStatus) === TEAM_BALANCE_STATS_STATUS.LOADED
)

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const hasObservedUsageEvidence = stats => {
  const values = [
    stats?.games,
    stats?.minutes,
    stats?.starts,
    stats?.substituteIn,
    stats?.substitutedOut,
    stats?.goals,
  ].map(toKnownNonNegativeNumber)

  return values.some(value => value !== null && value > 0)
}

export const buildTeamBalanceDataReliability = ({ players = [] } = {}) => {
  const rosterPlayers = (Array.isArray(players) ? players : [])
    .filter(player => player && typeof player === 'object')
    .filter(isOperationalRosterPlayer)

  const loadedPlayers = rosterPlayers.filter(isStatsLoaded)
  const loadedPlayerStats = loadedPlayers.map(getPlayerStats)
  const observedLoadedPlayers = loadedPlayers.filter(player => (
    hasObservedUsageEvidence(getPlayerStats(player))
  ))
  const ambiguousZeroLoadedCount = Math.max(
    loadedPlayers.length - observedLoadedPlayers.length,
    0
  )
  const knownMinutesCount = loadedPlayerStats.filter(stats => (
    toKnownNonNegativeNumber(stats.minutes) !== null
  )).length
  const positiveTeamMinutesValues = loadedPlayerStats.map(stats => (
    toKnownNonNegativeNumber(stats.teamMinutes)
  )).filter(value => value !== null && value > 0)
  const uniquePositiveTeamMinutesValues = [...new Set(positiveTeamMinutesValues)]
  const positiveTeamMinutesCount = positiveTeamMinutesValues.length
  const teamMinutesConsistent = uniquePositiveTeamMinutesValues.length <= 1
  const totalLoadedMinutes = loadedPlayerStats.reduce((total, stats) => {
    const minutes = toKnownNonNegativeNumber(stats.minutes)
    return total + (minutes === null ? 0 : minutes)
  }, 0)
  const rosterCount = rosterPlayers.length
  const loadedCount = loadedPlayers.length
  const observedLoadedCount = observedLoadedPlayers.length
  const missingCount = Math.max(rosterCount - loadedCount, 0)
  const loadedCoverage = rosterCount > 0 ? loadedCount / rosterCount : 0
  const observedCoverage = rosterCount > 0 ? observedLoadedCount / rosterCount : 0
  const minutesFieldCoverage = loadedCount > 0 ? knownMinutesCount / loadedCount : 0
  const teamMinutesCoverage = loadedCount > 0 ? positiveTeamMinutesCount / loadedCount : 0
  const hasUsableMinutes = totalLoadedMinutes > 0 && knownMinutesCount > 0

  let reliability = TEAM_BALANCE_RELIABILITY.INSUFFICIENT

  if (
    hasUsableMinutes &&
    loadedCoverage === 1 &&
    minutesFieldCoverage === 1 &&
    ambiguousZeroLoadedCount === 0
  ) {
    reliability = TEAM_BALANCE_RELIABILITY.SUFFICIENT
  } else if (hasUsableMinutes && observedLoadedCount > 0) {
    reliability = TEAM_BALANCE_RELIABILITY.PARTIAL
  }

  const distributionAvailability = reliability === TEAM_BALANCE_RELIABILITY.SUFFICIENT
    ? TEAM_BALANCE_AVAILABILITY.AVAILABLE
    : reliability === TEAM_BALANCE_RELIABILITY.PARTIAL
      ? TEAM_BALANCE_AVAILABILITY.LIMITED
      : TEAM_BALANCE_AVAILABILITY.UNAVAILABLE
  const possibleMinutesAvailability = (
    positiveTeamMinutesCount === loadedCount &&
    loadedCount > 0 &&
    teamMinutesConsistent
  )
    ? distributionAvailability
    : positiveTeamMinutesCount > 0 && reliability !== TEAM_BALANCE_RELIABILITY.INSUFFICIENT
      ? TEAM_BALANCE_AVAILABILITY.LIMITED
      : TEAM_BALANCE_AVAILABILITY.UNAVAILABLE

  return {
    reliability,
    rosterCount,
    loadedCount,
    observedLoadedCount,
    ambiguousZeroLoadedCount,
    sufficientBlockedByAmbiguousZeros: (
      hasUsableMinutes &&
      loadedCoverage === 1 &&
      minutesFieldCoverage === 1 &&
      ambiguousZeroLoadedCount > 0
    ),
    missingCount,
    loadedCoverage,
    observedCoverage,
    knownMinutesCount,
    unknownMinutesCount: Math.max(loadedCount - knownMinutesCount, 0),
    minutesFieldCoverage,
    positiveTeamMinutesCount,
    missingTeamMinutesCount: Math.max(loadedCount - positiveTeamMinutesCount, 0),
    teamMinutesCoverage,
    teamMinutesConsistent,
    teamMinutesValuesCount: uniquePositiveTeamMinutesValues.length,
    teamMinutesRange: uniquePositiveTeamMinutesValues.length > 0
      ? {
          min: Math.min(...uniquePositiveTeamMinutesValues),
          max: Math.max(...uniquePositiveTeamMinutesValues),
        }
      : null,
    totalLoadedMinutes,
    availability: {
      minutesDistribution: distributionAvailability,
      possibleMinutesUsage: possibleMinutesAvailability,
    },
  }
}
