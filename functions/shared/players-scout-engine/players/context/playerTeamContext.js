// src/shared/scouting/players/context/playerTeamContext.js

import {
  TEAM_FILTER,
} from '../ids.js'

import {
  PLAYER_CONTEXT_SIDE,
  PLAYER_TEAM_CONTEXT,
} from './playerContext.model.js'

const POSITIVE_LEVELS = new Set([
  'positive',
  'high',
  'elite',
  'חיובי',
  'עדיפות גבוהה',
  'יעד מוביל',
])

const NEUTRAL_LEVELS = new Set([
  'neutral',
  'regular',
  'רגיל',
])

const ADVERSE_LEVELS = new Set([
  'low',
  'below',
  'עדיפות נמוכה',
  'נמוכה',
])

const toNum = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const hasScoutSideValue = value => Boolean(
  value &&
  typeof value === 'object' &&
  (
    value.priorityLevel ||
    value.scoutPriorityScore !== null && value.scoutPriorityScore !== undefined ||
    value.priority?.level ||
    value.priority?.score !== null && value.priority?.score !== undefined
  )
)

const getTeamScoutSide = ({ team = {}, side = '' } = {}) => {
  const candidates = [
    team[side],
    team.performance?.[side],
    team.teamScout?.[side],
    team.scout?.[side],
    team.teamPerformance?.[side],
    team.domain?.performance?.[side],
    team.performanceView?.[side],
  ]

  return candidates.find(hasScoutSideValue) || null
}

const getPriorityLevel = (sideData = {}) => {
  return String(sideData.priorityLevel || sideData.priority?.level || '')
    .trim()
    .toLowerCase()
}

const getPriorityScore = (sideData = {}) => {
  return toNum(sideData.scoutPriorityScore, toNum(sideData.priority?.score, null))
}

const classifySide = (sideData = null) => {
  if (!sideData) return PLAYER_TEAM_CONTEXT.UNAVAILABLE

  const priorityLevel = getPriorityLevel(sideData)

  if (POSITIVE_LEVELS.has(priorityLevel)) return PLAYER_TEAM_CONTEXT.SUPPORTIVE
  if (NEUTRAL_LEVELS.has(priorityLevel)) return PLAYER_TEAM_CONTEXT.NEUTRAL
  if (ADVERSE_LEVELS.has(priorityLevel)) return PLAYER_TEAM_CONTEXT.ADVERSE

  const score = getPriorityScore(sideData)

  if (!Number.isFinite(score)) return PLAYER_TEAM_CONTEXT.UNAVAILABLE
  if (score >= 60) return PLAYER_TEAM_CONTEXT.SUPPORTIVE
  if (score >= 50) return PLAYER_TEAM_CONTEXT.NEUTRAL

  return PLAYER_TEAM_CONTEXT.ADVERSE
}

const getRelevantSide = (teamFilter = '') => {
  if (
    teamFilter === TEAM_FILTER.ATTACK_POSITIVE ||
    teamFilter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10
  ) {
    return PLAYER_CONTEXT_SIDE.ATTACK
  }

  if (teamFilter === TEAM_FILTER.DEFENSE_POSITIVE) {
    return PLAYER_CONTEXT_SIDE.DEFENSE
  }

  if (
    teamFilter === TEAM_FILTER.ANY_POSITIVE ||
    teamFilter === TEAM_FILTER.CLEAR_POSITIVE
  ) {
    return PLAYER_CONTEXT_SIDE.BOTH
  }

  return PLAYER_CONTEXT_SIDE.BOTH
}

const combineContexts = ({ attackContext, defenseContext, relevantSide }) => {
  if (relevantSide === PLAYER_CONTEXT_SIDE.ATTACK) return attackContext
  if (relevantSide === PLAYER_CONTEXT_SIDE.DEFENSE) return defenseContext
  if (relevantSide === PLAYER_CONTEXT_SIDE.NONE) return PLAYER_TEAM_CONTEXT.NEUTRAL

  const available = [attackContext, defenseContext]
    .filter(value => value !== PLAYER_TEAM_CONTEXT.UNAVAILABLE)

  if (!available.length) return PLAYER_TEAM_CONTEXT.UNAVAILABLE
  if (available.every(value => value === PLAYER_TEAM_CONTEXT.SUPPORTIVE)) {
    return PLAYER_TEAM_CONTEXT.SUPPORTIVE
  }
  if (available.every(value => value === PLAYER_TEAM_CONTEXT.ADVERSE)) {
    return PLAYER_TEAM_CONTEXT.ADVERSE
  }
  if (available.every(value => value === PLAYER_TEAM_CONTEXT.NEUTRAL)) {
    return PLAYER_TEAM_CONTEXT.NEUTRAL
  }

  return PLAYER_TEAM_CONTEXT.MIXED
}

export const buildPlayerTeamContext = ({ profile = {}, team = {} } = {}) => {
  const attackData = getTeamScoutSide({ team, side: 'offense' })
  const defenseData = getTeamScoutSide({ team, side: 'defense' })
  const attackContext = classifySide(attackData)
  const defenseContext = classifySide(defenseData)
  const relevantSide = getRelevantSide(profile.teamFilter)
  const classification = combineContexts({
    attackContext,
    defenseContext,
    relevantSide,
  })

  return {
    classification,
    relevantSide,
    attack: {
      classification: attackContext,
      priorityLevel: getPriorityLevel(attackData || {}),
      score: getPriorityScore(attackData || {}),
    },
    defense: {
      classification: defenseContext,
      priorityLevel: getPriorityLevel(defenseData || {}),
      score: getPriorityScore(defenseData || {}),
    },
    legacyFilter: profile.teamFilter || TEAM_FILTER.ANY,
  }
}
