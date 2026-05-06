// shared/games/insights/team/sections/forecast/forecast.rules.js

export function hasForecastRisk(comparisons = {}) {
  return Boolean(
    comparisons.points?.isRisk ||
      comparisons.goalsFor?.isRisk ||
      comparisons.goalsAgainst?.isRisk
  )
}

export function getForecastOverallTone(comparisons = {}) {
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
