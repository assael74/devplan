// shared/teams/targets/teamTargets.builder.js

import {
  isExactTargetPositionMode,
  isRangeTargetPositionMode,
  isTeamTargetProfileId,
  normalizeTeamTargetPositionMode,
} from './teamTargets.model.js'

import {
  getTeamTargetProfileById,
  resolveTeamTargetProfileByRank,
  resolveTeamTargetProfileByProjectedPoints,
} from './teamTargets.selectors.js'

const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

const toTargetNumber = (value) => {
  if (value === undefined || value === null || value === '') return null

  const n = Number(value)

  return Number.isFinite(n) ? n : null
}

const normalizeTargetPosition = (value) => {
  return clean(value)
}

const normalizeTargetProfileId = (value) => {
  return clean(value)
}

const resolveProfileFromExactPosition = (targetPosition) => {
  const rank = toTargetNumber(targetPosition)

  if (!rank) return null

  return resolveTeamTargetProfileByRank(rank)
}

const resolveProfileFromRangePosition = (targetPosition) => {
  if (!isTeamTargetProfileId(targetPosition)) return null

  return getTeamTargetProfileById(targetPosition)
}

export const resolveTeamTargetProfile = ({
  targetPositionMode,
  targetPosition,
  targetProfileId,
}) => {
  const savedProfile = getTeamTargetProfileById(targetProfileId)

  if (savedProfile) return savedProfile

  if (isExactTargetPositionMode(targetPositionMode)) {
    return resolveProfileFromExactPosition(targetPosition)
  }

  if (isRangeTargetPositionMode(targetPositionMode)) {
    return resolveProfileFromRangePosition(targetPosition)
  }

  return null
}

export const resolveTeamTargetProfileId = ({
  targetPositionMode,
  targetPosition,
  targetProfileId,
}) => {
  const profile = resolveTeamTargetProfile({
    targetPositionMode,
    targetPosition,
    targetProfileId,
  })

  return profile?.id || ''
}

export function resolveTeamTargetProfileFromTeam(team = {}) {
  const targetPositionMode = normalizeTeamTargetPositionMode(team?.targetPositionMode)
  const targetPosition = normalizeTargetPosition(team?.targetPosition)
  const targetProfileId = normalizeTargetProfileId(team?.targetProfileId)

  const targetProfile = resolveTeamTargetProfile({
    targetPositionMode,
    targetPosition,
    targetProfileId,
  })

  return {
    targetPositionMode,
    targetPosition,
    targetProfileId,
    resolvedProfileId: targetProfile?.id || '',
    targetProfile: targetProfile || null,
  }
}

export function resolveTeamForecastProfileFromActive(active = {}) {
  return resolveTeamTargetProfileByProjectedPoints(
    active?.projectedTotalPoints
  )
}

const getTargetLabel = ({
  targetPositionMode,
  targetPosition,
  targetProfile,
}) => {
  if (isExactTargetPositionMode(targetPositionMode)) {
    return targetPosition ? `מקום ${targetPosition}` : ''
  }

  if (isRangeTargetPositionMode(targetPositionMode)) {
    return targetProfile?.rankLabel || targetProfile?.label || ''
  }

  return ''
}

const buildTargetItems = ({
  targetPositionMode,
  targetPosition,
  targetProfile,
}) => {
  const forecast = targetProfile?.targets?.forecast || {}

  return [
    {
      id: 'targetPosition',
      label: 'יעד טבלה',
      value: getTargetLabel({
        targetPositionMode,
        targetPosition,
        targetProfile,
      }),
      unit: 'text',
    },
    {
      id: 'targetPoints',
      label: 'נקודות יעד',
      value: toTargetNumber(forecast.points),
      unit: 'points',
    },
    {
      id: 'targetSuccessRate',
      label: 'אחוז הצלחה יעד',
      value: toTargetNumber(forecast.pointsRate),
      unit: 'percent',
    },
    {
      id: 'targetGoalDifference',
      label: 'הפרש שערים יעד',
      value: toTargetNumber(forecast.goalDifference),
      unit: 'goals',
    },
    {
      id: 'targetGoalsFor',
      label: 'שערי זכות יעד',
      value: toTargetNumber(forecast.goalsFor),
      unit: 'goals',
    },
    {
      id: 'targetGoalsAgainst',
      label: 'שערי חובה יעד',
      value: toTargetNumber(forecast.goalsAgainst),
      unit: 'goals',
    },
  ].filter((item) => {
    return item.value !== null && item.value !== undefined && item.value !== ''
  })
}

export function buildTeamTargetsState(raw = null) {
  const targetPositionMode = normalizeTeamTargetPositionMode(raw?.targetPositionMode)
  const targetPosition = normalizeTargetPosition(raw?.targetPosition)
  const targetProfileId = normalizeTargetProfileId(raw?.targetProfileId)

  const targetProfile = resolveTeamTargetProfile({
    targetPositionMode,
    targetPosition,
    targetProfileId,
  })

  if (!targetProfile) {
    return {
      hasTargets: false,
      status: '',
      assignedAt: '',
      assignedBy: '',

      targetPositionMode,
      targetPosition,
      targetProfileId,

      resolvedProfileId: '',
      targetProfile: null,

      values: {},
      items: [],
      groups: {},
      raw,
    }
  }

  const forecast = targetProfile?.targets?.forecast || {}
  const resolvedProfileId = targetProfile?.id || ''

  const values = {
    targetLabel: getTargetLabel({
      targetPositionMode,
      targetPosition,
      targetProfile,
    }),

    points: toTargetNumber(forecast.points),
    successRate: toTargetNumber(forecast.pointsRate),
    goalDifference: toTargetNumber(forecast.goalDifference),
    goalsFor: toTargetNumber(forecast.goalsFor),
    goalsAgainst: toTargetNumber(forecast.goalsAgainst),
  }

  const items = buildTargetItems({
    targetPositionMode,
    targetPosition,
    targetProfile,
  })

  return {
    hasTargets: true,

    status: raw?.targetsStatus || raw?.status || '',
    assignedAt: raw?.targetsAssignedAt || raw?.assignedAt || '',
    assignedBy: raw?.targetsAssignedBy || raw?.assignedBy || '',

    targetPositionMode,
    targetPosition,
    targetProfileId,

    resolvedProfileId,
    targetProfile,

    values,
    items,
    groups: targetProfile?.targets || {},

    raw,
  }
}

// legacy aliases
export const resolveTeamGamesTargetProfile = resolveTeamTargetProfile
export const resolveTeamGamesTargetProfileId = resolveTeamTargetProfileId
export const resolveTeamGamesTargetProfileFromTeam = resolveTeamTargetProfileFromTeam
export const resolveTeamGamesForecastProfileFromActive = resolveTeamForecastProfileFromActive
