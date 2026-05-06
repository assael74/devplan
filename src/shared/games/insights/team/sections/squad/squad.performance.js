// shared/games/insights/team/sections/squad/squad.performance.js

import {
  hasNumber,
  pickNumber,
} from '../../common/index.js'

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

function getLevelLabel(level) {
  return (
    level?.rankRangeLabel ||
    level?.rankLabel ||
    level?.shortLabel ||
    level?.label ||
    ''
  )
}

export function buildSquadPerformanceContext(insights = {}) {
  const active = insights.active || {}
  const targetProgress = insights.targetProgress || {}

  const targetProfile =
    insights.targetProfile ||
    insights.benchmarkLevel ||
    {}

  const pointsRate = pickNumber(active, ['pointsRate'], null)
  const projectedTotalPoints = pickNumber(active, ['projectedTotalPoints'], null)
  const projectedGoalsFor = pickNumber(active, ['projectedGoalsFor'], null)

  const targetFromRows = getTargetProgressValue(targetProgress, 'points')
  const targetPoints = hasNumber(targetFromRows)
    ? Number(targetFromRows)
    : pickNumber(targetProfile, ['targetPoints'], null)

  const targetGoalsForFromRows = getTargetProgressValue(targetProgress, 'goalsFor')
  const targetGoalsFor = hasNumber(targetGoalsForFromRows)
    ? Number(targetGoalsForFromRows)
    : pickNumber(targetProfile, ['targetGoalsFor'], null)

  const isOnTarget =
    hasNumber(projectedTotalPoints) &&
    hasNumber(targetPoints) &&
    Number(targetPoints) > 0 &&
    Number(projectedTotalPoints) >= Number(targetPoints) * 0.97

  const isGoalsForOnTarget =
    hasNumber(projectedGoalsFor) &&
    hasNumber(targetGoalsFor) &&
    Number(targetGoalsFor) > 0 &&
    Number(projectedGoalsFor) >= Number(targetGoalsFor) * 0.94

  const isPositive = hasNumber(pointsRate) && Number(pointsRate) >= 50
  const isStrong = Boolean(isOnTarget || isGoalsForOnTarget || isPositive)

  const isWeak =
    hasNumber(pointsRate) &&
    Number(pointsRate) < 40 &&
    !isOnTarget

  return {
    targetProfile,
    targetLevel: targetProfile,
    targetLevelId: targetProfile?.id || null,
    targetLabel: getLevelLabel(targetProfile),

    pointsRate,
    projectedTotalPoints,
    projectedGoalsFor,

    targetPoints,
    targetGoalsFor,

    isOnTarget,
    isGoalsForOnTarget,
    isPositive,
    isStrong,
    isWeak,
  }
}
