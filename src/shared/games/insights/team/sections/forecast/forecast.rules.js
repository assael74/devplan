// shared/games/insights/team/sections/forecast/forecast.rules.js

export function hasForecastRisk(comparisons = {}) {
  return Boolean(
    comparisons.points?.isRisk ||
      comparisons.goalsFor?.isRisk ||
      comparisons.goalsAgainst?.isRisk
  )
}

export function getTargetGapTone(targetGap = {}) {
  if (targetGap?.isAboveTarget === true) return 'success'
  if (targetGap?.isOnTarget === true) return 'success'
  if (targetGap?.isBelowTarget === true) return 'danger'

  if (targetGap?.relation === 'above') return 'success'
  if (targetGap?.relation === 'onTarget') return 'success'
  if (targetGap?.relation === 'below') return 'danger'

  return ''
}

export function getForecastOverallTone(
  comparisons = {},
  targetGap = {}
) {
  const targetGapTone = getTargetGapTone(targetGap)

  if (targetGapTone) {
    return targetGapTone
  }

  if (comparisons.goalsFor?.status === 'above' && comparisons.goalsAgainst?.isRisk) {
    return 'warning'
  }

  if (
    comparisons.goalsAgainst?.isRisk ||
    comparisons.points?.isRisk ||
    comparisons.goalsFor?.isRisk
  ) {
    return 'warning'
  }

  if (comparisons.points?.isPositive) {
    return 'success'
  }

  return 'neutral'
}

export function getForecastActionLabel(comparisons = {}) {
  return hasForecastRisk(comparisons) ? 'מוקד פעולה' : 'המשך פעולה'
}
