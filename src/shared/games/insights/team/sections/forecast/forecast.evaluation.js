// shared/games/insights/team/sections/forecast/forecast.evaluation.js

import {
  hasNumber,
  roundNumber,
  toNumber,
} from '../../common/index.js'

import {
  getForecastTargetLabel,
  getForecastTargetValues,
  resolveForecastTargetProfile,
} from './forecast.targets.js'

function compareHigherIsBetter({ actual, target, tolerancePct = 3 }) {
  if (!hasNumber(actual) || !hasNumber(target) || Number(target) <= 0) {
    return null
  }

  const actualValue = toNumber(actual)
  const targetValue = toNumber(target)
  const ratio = (actualValue / targetValue) * 100
  const gap = actualValue - targetValue

  let status = 'below'

  if (ratio >= 100 + tolerancePct) status = 'above'
  else if (ratio >= 100 - tolerancePct) status = 'met'

  return {
    actual: roundNumber(actualValue, 1),
    target: roundNumber(targetValue, 1),
    ratio: Math.round(ratio),
    gap: roundNumber(gap, 1),
    status,
    isPositive: status === 'above' || status === 'met',
    isRisk: status === 'below',
  }
}

function compareLowerIsBetter({ actual, target, tolerancePct = 10 }) {
  if (!hasNumber(actual) || !hasNumber(target) || Number(target) <= 0) {
    return null
  }

  const actualValue = toNumber(actual)
  const targetValue = toNumber(target)
  const ratio = (actualValue / targetValue) * 100
  const gap = actualValue - targetValue

  let status = 'below'

  if (actualValue <= targetValue) {
    status = 'above'
  } else if (actualValue <= targetValue * (1 + tolerancePct / 100)) {
    status = 'met'
  }

  return {
    actual: roundNumber(actualValue, 1),
    target: roundNumber(targetValue, 1),
    ratio: Math.round(ratio),
    gap: roundNumber(gap, 1),
    status,
    isPositive: status === 'above' || status === 'met',
    isRisk: status === 'below',
  }
}

export function buildForecastEvaluation(metrics, insights = {}) {
  const targetProfile = resolveForecastTargetProfile(insights)

  const targets = getForecastTargetValues({
    targetProfile,
    targetProgress: insights.targetProgress,
  })

  const comparisons = {
    points: compareHigherIsBetter({
      actual: metrics.projectedTotalPoints,
      target: targets.points,
      tolerancePct: 3,
    }),

    goalsFor: compareHigherIsBetter({
      actual: metrics.projectedGoalsFor,
      target: targets.goalsFor,
      tolerancePct: 6,
    }),

    goalsAgainst: compareLowerIsBetter({
      actual: metrics.projectedGoalsAgainst,
      target: targets.goalsAgainst,
      tolerancePct: 10,
    }),
  }

  const hasActionRisk = Boolean(
    comparisons.points?.isRisk ||
      comparisons.goalsFor?.isRisk ||
      comparisons.goalsAgainst?.isRisk
  )

  return {
    targetProfile,
    targetLevel: targetProfile,
    targetLevelId: targetProfile?.id || null,
    targetLabel: getForecastTargetLabel(targetProfile),
    targets,
    comparisons,
    hasActionRisk,
    hasTargets: Boolean(targetProfile?.id),
  }
}
