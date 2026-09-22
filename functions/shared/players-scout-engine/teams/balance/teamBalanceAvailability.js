// src/shared/scouting/teams/balance/teamBalanceAvailability.js

import { TEAM_LINE_STRUCTURE_THRESHOLDS } from '../../config/lineStructureThresholds.js'

export const TEAM_BALANCE_AVAILABILITY_REASON = Object.freeze({
  SEASON_SAMPLE_INSUFFICIENT: 'season_sample_insufficient',
  STATS_NOT_LOADED: 'stats_not_loaded',
})

const numberOrZero = value => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

export const buildTeamBalanceAvailability = ({
  teamGamePlayed,
  lineStructure = {},
} = {}) => {
  const games = numberOrZero(teamGamePlayed)
  const loadedRelevantPlayersCount = numberOrZero(lineStructure.loadedRelevantPlayersCount)
  const minimumGames = numberOrZero(lineStructure.minimumGames) ||
    TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES

  if (games < minimumGames) {
    return {
      availability: 'unavailable',
      availabilityReason: TEAM_BALANCE_AVAILABILITY_REASON.SEASON_SAMPLE_INSUFFICIENT,
    }
  }

  if (loadedRelevantPlayersCount === 0) {
    return {
      availability: 'unavailable',
      availabilityReason: TEAM_BALANCE_AVAILABILITY_REASON.STATS_NOT_LOADED,
    }
  }

  return {
    availability: 'available',
    availabilityReason: null,
  }
}
