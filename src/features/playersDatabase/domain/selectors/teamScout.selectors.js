// features/playersDatabase/domain/selectors/teamScout.selectors.js

import { createEmptyTeamScoutSide } from '../contracts/teamScout.contract.js'

export const selectTeamOffensePerformance = teamSeason => (
  teamSeason?.performance?.offense || createEmptyTeamScoutSide('offense')
)

export const selectTeamDefensePerformance = teamSeason => (
  teamSeason?.performance?.defense || createEmptyTeamScoutSide('defense')
)

export const selectTeamPerformanceSide = (teamSeason, side) => (
  side === 'defense'
    ? selectTeamDefensePerformance(teamSeason)
    : selectTeamOffensePerformance(teamSeason)
)

export const selectTeamPerformanceMetrics = (teamSeason, side) => {
  const value = selectTeamPerformanceSide(teamSeason, side)

  return {
    priority: {
      score: value.scoutPriorityScore,
      level: value.priorityLevel,
    },
    quality: {
      rate: value.qualityRate,
    },
    target: {
      rate: value.targetRate,
      normalized: value.targetNormalized,
      level: value.targetLevel,
    },
    ranking: {
      rate: value.rankingRate,
      normalized: value.rankingNormalized,
      level: value.rankingLevel,
    },
    anomaly: {
      rate: value.anomalyRate,
      level: value.anomalyLevel,
    },
    opportunityType: value.opportunityType,
  }
}

export const selectTeamOffenseScout = selectTeamOffensePerformance
export const selectTeamDefenseScout = selectTeamDefensePerformance
export const selectTeamScoutSide = selectTeamPerformanceSide
