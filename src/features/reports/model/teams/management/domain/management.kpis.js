// teamProfile/sharedLogic/management/management.kpis.js

import { safeNum } from './management.safe.js'

export function calcActualSuccessRate(pointsValue, leagueRoundValue) {
  const points = Number(pointsValue)
  const leagueRound = Number(leagueRoundValue)

  if (
    !Number.isFinite(points) ||
    !Number.isFinite(leagueRound) ||
    leagueRound <= 0
  ) {
    return ''
  }

  return Math.round((points / (leagueRound * 3)) * 100)
}

export function calcAchievementRate(actual, target, direction = 'higher') {
  const actualValue = Number(actual)
  const targetValue = Number(target)

  if (
    !Number.isFinite(actualValue) ||
    !Number.isFinite(targetValue) ||
    targetValue <= 0
  ) {
    return ''
  }

  const raw =
    direction === 'lower'
      ? (targetValue / Math.max(actualValue, 1)) * 100
      : (actualValue / targetValue) * 100

  return Math.min(100, Math.round(raw))
}

export function buildTargetsSummary(team) {
  const summary = team?.teamPerformance?.summary || {}
  const hasTargets = Boolean(team?.targets?.hasTargets)

  return {
    hasTargets,
    activeTargetsCount: safeNum(summary.activeTargetsCount),
    metTargetsCount: safeNum(summary.metTargetsCount),
  }
}
