// src/features/playersDatabase/domain/selectors/teamScout.selectors.js

import { createEmptyTeamScoutSide } from '../contracts/teamScout.contract.js'

export const selectTeamOffensePerformance = teamSeason => teamSeason?.performance?.offense || createEmptyTeamScoutSide('offense')
export const selectTeamDefensePerformance = teamSeason => teamSeason?.performance?.defense || createEmptyTeamScoutSide('defense')
export const selectTeamPerformanceSide = (teamSeason, side) => side === 'defense' ? selectTeamDefensePerformance(teamSeason) : selectTeamOffensePerformance(teamSeason)
export const selectTeamPerformancePriority = (teamSeason, side) => {
  const value = selectTeamPerformanceSide(teamSeason, side)
  return { rate: value.priorityRate, level: value.priorityLevel, anomalyLevel: value.anomalyLevel }
}

// Transitional aliases for existing consumers.
export const selectTeamOffenseScout = selectTeamOffensePerformance
export const selectTeamDefenseScout = selectTeamDefensePerformance
export const selectTeamScoutSide = selectTeamPerformanceSide
export const selectTeamScoutPriority = selectTeamPerformancePriority
