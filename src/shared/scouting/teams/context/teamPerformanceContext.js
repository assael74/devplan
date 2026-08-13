// src/shared/scouting/teams/context/teamPerformanceContext.js

import { TEAM_SCOUT_PRIORITY_LEVEL } from '../teamScout.model.js'
import {
  TEAM_SCOUT_CONTEXT_CONFIDENCE,
  TEAM_SCOUT_PERFORMANCE_CONTEXT,
} from './teamContext.model.js'

const resolvePerformanceContext = priorityLevel => {
  if (priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.ELITE) {
    return TEAM_SCOUT_PERFORMANCE_CONTEXT.STRONG
  }

  if (
    priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.HIGH ||
    priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE
  ) {
    return TEAM_SCOUT_PERFORMANCE_CONTEXT.POSITIVE
  }

  if (priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL) {
    return TEAM_SCOUT_PERFORMANCE_CONTEXT.NEUTRAL
  }

  if (priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.LOW) {
    return TEAM_SCOUT_PERFORMANCE_CONTEXT.WEAK
  }

  return TEAM_SCOUT_PERFORMANCE_CONTEXT.UNKNOWN
}

const buildSideContext = performance => {
  if (!performance) {
    return {
      context: TEAM_SCOUT_PERFORMANCE_CONTEXT.UNKNOWN,
      confidence: TEAM_SCOUT_CONTEXT_CONFIDENCE.LOW,
      priorityLevel: TEAM_SCOUT_PRIORITY_LEVEL.UNAVAILABLE,
      evidence: [],
    }
  }

  const priorityLevel = performance.priorityLevel || TEAM_SCOUT_PRIORITY_LEVEL.UNAVAILABLE

  return {
    context: resolvePerformanceContext(priorityLevel),
    confidence: TEAM_SCOUT_CONTEXT_CONFIDENCE.HIGH,
    priorityLevel,
    targetRate: performance.targetRate,
    rankingRate: performance.rankingRate,
    anomalyRate: performance.anomalyRate,
    qualityRate: performance.qualityRate,
    evidence: [
      `priority_level:${priorityLevel}`,
      `target_rate:${performance.targetRate}`,
      `ranking_rate:${performance.rankingRate}`,
    ],
  }
}

export const buildTeamPerformanceContext = ({ offense, defense } = {}) => {
  return {
    offense: buildSideContext(offense),
    defense: buildSideContext(defense),
  }
}
