// src/features/playersDatabase/domain/orchestration/buildDbPlayerScoutLegacyResult.js

import {
  buildPlayerScoutResult,
  buildScoutProfileCombinations,
  TEAM_FILTER,
} from '../../../../shared/players/scouting/index.js'
import {
  buildPlayerProfileHierarchy,
} from '../../../../shared/scouting/players/index.js'

const normalizePriorityLevel = value => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
)

const isPositivePriority = value => {
  const level = normalizePriorityLevel(value)

  return [
    'positive',
    'positivepriority',
    'חיובי',
    'חיובית',
    'עדיפותחיובית',
    'high',
    'highpriority',
    'עדיפותגבוהה',
    'גבוהה',
    'elite',
    'leadingtarget',
    'target',
    'יעדמוביל',
  ].includes(level)
}

const resolvePriorityLevel = side => (
  side?.priorityLevel || side?.priority?.level || ''
)

const passesTeamFilter = ({ signal, team }) => {
  const filter = signal?.teamFilter || ''

  if (!filter || filter === TEAM_FILTER.ANY) return true

  const attackPositive = isPositivePriority(
    resolvePriorityLevel(team?.offense)
  )
  const defensePositive = isPositivePriority(
    resolvePriorityLevel(team?.defense)
  )
  const goals = Number(signal?.metrics?.goals)
  const goalsBypass = Number.isFinite(goals) && goals >= 10

  if (filter === TEAM_FILTER.ATTACK_POSITIVE) {
    return attackPositive
  }

  if (filter === TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10) {
    return attackPositive || goalsBypass
  }

  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) {
    return defensePositive
  }

  if (
    filter === TEAM_FILTER.ANY_POSITIVE ||
    filter === TEAM_FILTER.CLEAR_POSITIVE
  ) {
    return attackPositive || defensePositive
  }

  return false
}

export const buildDbPlayerScoutLegacyResult = ({
  player,
  team,
  season,
  perspective,
  normalizationMode,
  searchDistance,
  profiles,
} = {}) => {
  const result = buildPlayerScoutResult({
    player,
    team,
    season,
    perspective,
    normalizationMode,
    searchDistance,
    profiles,
  })
  const rawSignals = Array.isArray(result?.signals)
    ? result.signals
    : []
  const signals = rawSignals.filter(signal => (
    passesTeamFilter({
      signal,
      team,
    })
  ))
  const profileHierarchy = buildPlayerProfileHierarchy({ signals })

  return {
    ...result,
    signals,
    combinations: buildScoutProfileCombinations({ signals }),
    profileHierarchy,
    bestSignal: profileHierarchy.primarySignal,
  }
}
