// shared/games/insights/team/sections/forecast/forecast.metrics.js

import { hasNumber, pickNumber } from '../../common/index.js'

export function buildForecastMetrics(insights = {}) {
  const active = insights.active || {}
  const calculation = insights.calculation || {}

  const projectedTotalPoints = pickNumber(
    active,
    ['projectedTotalPoints'],
    null
  )

  const projectedGoalsFor = pickNumber(active, ['projectedGoalsFor'], null)
  const projectedGoalsAgainst = pickNumber(active, ['projectedGoalsAgainst'], null)

  const pointsRate = pickNumber(active, ['pointsRate'], null)
  const goalDifference = pickNumber(active, ['goalDifference'], null)

  const isReady =
    active?.isReady === true ||
    hasNumber(projectedTotalPoints) ||
    hasNumber(pointsRate)

  return {
    active,
    calculation,

    projectedTotalPoints,
    projectedGoalsFor,
    projectedGoalsAgainst,
    pointsRate,
    goalDifference,

    isReady,
  }
}
