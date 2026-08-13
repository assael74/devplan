// src/shared/scouting/teams/opportunity/teamNeeds.js

import { TEAM_SCOUT_PRIORITY_LEVEL } from '../teamScout.model.js'
import {
  TEAM_SCOUT_NEED_ID,
  TEAM_SCOUT_NEED_LEVEL,
} from './teamOpportunity.model.js'

const PRIORITY_ORDER = {
  [TEAM_SCOUT_PRIORITY_LEVEL.LOW]: 0,
  [TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL]: 1,
  [TEAM_SCOUT_PRIORITY_LEVEL.POSITIVE]: 2,
  [TEAM_SCOUT_PRIORITY_LEVEL.HIGH]: 3,
  [TEAM_SCOUT_PRIORITY_LEVEL.ELITE]: 4,
}

const resolveNeedLevel = performance => {
  if (!performance || !performance.priorityLevel) {
    return TEAM_SCOUT_NEED_LEVEL.UNKNOWN
  }

  if (performance.priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.LOW) {
    const targetRate = Number(performance.targetRate)

    if (Number.isFinite(targetRate) && targetRate < 70) {
      return TEAM_SCOUT_NEED_LEVEL.CRITICAL
    }

    return TEAM_SCOUT_NEED_LEVEL.HIGH
  }

  if (performance.priorityLevel === TEAM_SCOUT_PRIORITY_LEVEL.NEUTRAL) {
    return TEAM_SCOUT_NEED_LEVEL.MODERATE
  }

  return TEAM_SCOUT_NEED_LEVEL.NONE
}

const buildNeed = ({ id, performance } = {}) => {
  const level = resolveNeedLevel(performance)

  return {
    id,
    level,
    active: level !== TEAM_SCOUT_NEED_LEVEL.NONE && level !== TEAM_SCOUT_NEED_LEVEL.UNKNOWN,
    evidence: performance
      ? [
        `priority_level:${performance.priorityLevel}`,
        `target_rate:${performance.targetRate}`,
        `quality_rate:${performance.qualityRate}`,
      ]
      : [],
  }
}

const buildBalanceProblem = ({ offense, defense } = {}) => {
  if (!offense || !defense) return null

  const offenseOrder = PRIORITY_ORDER[offense.priorityLevel]
  const defenseOrder = PRIORITY_ORDER[defense.priorityLevel]

  if (!Number.isFinite(offenseOrder) || !Number.isFinite(defenseOrder)) {
    return null
  }

  const gap = Math.abs(offenseOrder - defenseOrder)
  if (gap < 2) return null

  return {
    id: TEAM_SCOUT_NEED_ID.BALANCE_PROBLEM,
    level: gap >= 3
      ? TEAM_SCOUT_NEED_LEVEL.HIGH
      : TEAM_SCOUT_NEED_LEVEL.MODERATE,
    active: true,
    evidence: [
      `offense_priority:${offense.priorityLevel}`,
      `defense_priority:${defense.priorityLevel}`,
    ],
  }
}

export const buildTeamNeeds = ({ offense, defense } = {}) => {
  const attackingNeed = buildNeed({
    id: TEAM_SCOUT_NEED_ID.ATTACKING_NEED,
    performance: offense,
  })
  const defensiveNeed = buildNeed({
    id: TEAM_SCOUT_NEED_ID.DEFENSIVE_NEED,
    performance: defense,
  })
  const balanceProblem = buildBalanceProblem({ offense, defense })
  const needs = [attackingNeed, defensiveNeed]

  if (balanceProblem) needs.push(balanceProblem)

  return needs
}
