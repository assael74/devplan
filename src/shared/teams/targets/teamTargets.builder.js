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

import {
  resolveTeamTargetBenchmark,
  normalizeSeasonTotal,
} from './teamTargets.benchmark.js'

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

const toRangeLabel = (range = []) => {
  const min = toTargetNumber(range[0])
  const max = toTargetNumber(range[1])

  if (!min && !max) return ''
  if (min && !max) return `מקומות ${min}+`
  if (!min && max) return `עד מקום ${max}`

  return `מקומות ${min} - ${max}`
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

const getBenchmarkTargetLabel = ({
  targetPositionMode,
  targetPosition,
  benchmark,
  fallbackProfile,
}) => {
  if (isExactTargetPositionMode(targetPositionMode)) {
    return targetPosition ? `מקום ${targetPosition}` : ''
  }

  const profile = benchmark?.profile || fallbackProfile
  const rangeLabel = toRangeLabel(benchmark?.rankRange || profile?.rankRange)
  const label = profile?.label || fallbackProfile?.label || ''

  if (label && rangeLabel) return `${label} · ${rangeLabel}`

  return rangeLabel || label || ''
}

const buildBenchmarkGroups = (benchmark = {}) => {
  const difficulty = benchmark?.difficultySuccessRate || {}
  const scorers = benchmark?.scorersDistribution || {}
  const squad = benchmark?.squadBalance || {}

  return {
    homeAway: {
      home: { targetRate: toTargetNumber(benchmark.homeSuccessRate) },
      away: { targetRate: toTargetNumber(benchmark.awaySuccessRate) },
    },
    difficulty: {
      easy: { targetRate: toTargetNumber(difficulty.lower) },
      equal: { targetRate: toTargetNumber(difficulty.equal) },
      hard: { targetRate: toTargetNumber(difficulty.higher) },
    },
    scorers: {
      scorer: scorers.scorer || null,
      doubleDigitScorer: scorers.doubleDigitScorer || null,
      supportScorer: scorers.supportScorer || null,
      occasionalScorer: scorers.occasionalScorer || null,
    },
    squadUsage: {
      top14MinutesSharePct: squad.top14MinutesSharePct || null,
      playersOver500Minutes: squad.playersOver500Minutes || null,
      playersOver1000Minutes: squad.playersOver1000Minutes || null,
      playersOver1500Minutes: squad.playersOver1500Minutes || null,
      playersOver2000Minutes: squad.playersOver2000Minutes || null,
      playersOver20Starts: squad.playersOver20Starts || null,
      unallocatedMinutesSharePct: squad.unallocatedMinutesSharePct || null,
    },
  }
}

const buildBenchmarkTargetItems = ({
  targetPositionMode,
  targetPosition,
  benchmark,
  targetProfile,
  values,
}) => {
  return [
    {
      id: 'targetPosition',
      label: 'יעד טבלה',
      value: getBenchmarkTargetLabel({
        targetPositionMode,
        targetPosition,
        benchmark,
        fallbackProfile: targetProfile,
      }),
      unit: 'text',
    },
    {
      id: 'targetPoints',
      label: 'נקודות יעד',
      value: values.points,
      unit: 'points',
    },
    {
      id: 'targetSuccessRate',
      label: 'אחוז הצלחה יעד',
      value: values.successRate,
      unit: 'percent',
    },
    {
      id: 'targetGoalDifference',
      label: 'הפרש שערים יעד',
      value: values.goalDifference,
      unit: 'goals',
    },
    {
      id: 'targetGoalsFor',
      label: 'שערי זכות יעד',
      value: values.goalsFor,
      unit: 'goals',
    },
    {
      id: 'targetGoalsAgainst',
      label: 'שערי חובה יעד',
      value: values.goalsAgainst,
      unit: 'goals',
    },
  ].filter((item) => {
    return item.value !== null && item.value !== undefined && item.value !== ''
  })
}

const buildTargetItems = ({ targetPositionMode, targetPosition, targetProfile, }) => {
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

  const benchmark = resolveTeamTargetBenchmark({
    targetPositionMode,
    targetPosition,
    targetPositionProfile: raw?.targetPositionProfile,
    targetProfileId,
  })

  if (!targetProfile && !benchmark) {
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

  if (benchmark) {
    const leagueNumGames = toTargetNumber(raw?.leagueNumGames)
    const targetLabel = getBenchmarkTargetLabel({
      targetPositionMode,
      targetPosition,
      benchmark,
      fallbackProfile: targetProfile,
    })
    const rankRangeLabel = toRangeLabel(
      benchmark?.rankRange || targetProfile?.rankRange
    )

    const values = {
      targetLabel,
      rankRangeLabel,
      points: normalizeSeasonTotal({
        value: benchmark.points,
        leagueNumGames,
      }),
      successRate: toTargetNumber(benchmark.successRate),
      goalDifference: normalizeSeasonTotal({
        value: benchmark.goalDifference,
        leagueNumGames,
      }),
      goalsFor: normalizeSeasonTotal({
        value: benchmark.goalsFor,
        leagueNumGames,
      }),
      goalsAgainst: normalizeSeasonTotal({
        value: benchmark.goalsAgainst,
        leagueNumGames,
      }),
    }

    return {
      hasTargets: true,

      status: raw?.targetsStatus || raw?.status || '',
      assignedAt: raw?.targetsAssignedAt || raw?.assignedAt || '',
      assignedBy: raw?.targetsAssignedBy || raw?.assignedBy || '',

      targetPositionMode,
      targetPosition,
      targetProfileId,

      resolvedProfileId:
        benchmark?.targetPositionProfile || targetProfile?.id || '',
      targetProfile: benchmark?.profile || targetProfile || null,
      targetBenchmark: benchmark,
      targetSource: 'benchmark',

      values,
      items: buildBenchmarkTargetItems({
        targetPositionMode,
        targetPosition,
        benchmark,
        targetProfile,
        values,
      }),
      groups: buildBenchmarkGroups(benchmark),
      legacyGroups: targetProfile?.targets || {},

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
    targetSource: 'legacy',

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
