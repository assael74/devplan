// shared/games/insights/team/sections/forecast/forecast.targets.js

import { hasNumber } from '../../common/index.js'

function getTargetProgressValue(targetProgress, key) {
  const rows = Array.isArray(targetProgress?.rows) ? targetProgress.rows : []

  const row = rows.find((item) => {
    return item?.id === key || item?.key === key
  })

  if (!row) return null

  if (row.target !== undefined && row.target !== null) return row.target
  if (row.targetValue !== undefined && row.targetValue !== null) return row.targetValue

  return null
}

export function resolveForecastTargetProfile(insights = {}) {
  return insights.targetProfile || insights.benchmarkLevel || null
}

export function getForecastTargetValues({ targetProfile, targetProgress }) {
  const forecastTargets = targetProfile?.targets?.forecast || {}

  const pointsFromRows = getTargetProgressValue(targetProgress, 'points')
  const goalsForFromRows = getTargetProgressValue(targetProgress, 'goalsFor')
  const goalsAgainstFromRows = getTargetProgressValue(
    targetProgress,
    'goalsAgainst'
  )

  return {
    points: hasNumber(pointsFromRows)
      ? Number(pointsFromRows)
      : forecastTargets.points ?? targetProfile?.targetPoints,

    pointsRate:
      forecastTargets.pointsRate ?? targetProfile?.targetPointsRate ?? null,

    goalDifference:
      forecastTargets.goalDifference ??
      targetProfile?.targetGoalDifference ??
      null,

    goalsFor: hasNumber(goalsForFromRows)
      ? Number(goalsForFromRows)
      : forecastTargets.goalsFor ?? targetProfile?.targetGoalsFor,

    goalsAgainst: hasNumber(goalsAgainstFromRows)
      ? Number(goalsAgainstFromRows)
      : forecastTargets.goalsAgainst ?? targetProfile?.targetGoalsAgainst,
  }
}

export function getForecastTargetLabel(profile) {
  return (
    profile?.rankRangeLabel ||
    profile?.rankLabel ||
    profile?.shortLabel ||
    profile?.label ||
    ''
  )
}
