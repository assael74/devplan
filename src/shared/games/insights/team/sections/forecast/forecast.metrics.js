// shared/games/insights/team/sections/forecast/forecast.metrics.js

import { hasNumber, pickNumber } from '../../common/index.js'

const emptyObject = {}

const buildScoringMetrics = (insights = {}) => {
  const summary = insights?.teamScoringSummary || emptyObject

  return {
    teamRating: summary.teamRating ?? null,
    teamRatingRaw: summary.teamRatingRaw ?? null,

    tva: summary.tva ?? 0,
    pointsPaceDelta: summary.pointsPaceDelta ?? 0,

    actualPoints: summary.actualPoints ?? null,
    expectedPoints: summary.expectedPoints ?? null,

    actualGoalsFor: summary.actualGoalsFor ?? null,
    expectedGoalsFor: summary.expectedGoalsFor ?? null,
    goalsForDelta: summary.goalsForDelta ?? null,

    actualGoalsAgainst: summary.actualGoalsAgainst ?? null,
    expectedGoalsAgainst: summary.expectedGoalsAgainst ?? null,
    goalsAgainstDelta: summary.goalsAgainstDelta ?? null,

    ratedGames: summary.ratedGames ?? 0,
    reliability: summary.reliability || null,
  }
}

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

  const scoring = buildScoringMetrics(insights)

  const isReady =
    active?.isReady === true ||
    hasNumber(projectedTotalPoints) ||
    hasNumber(pointsRate) ||
    hasNumber(scoring.teamRating)

  return {
    active,
    calculation,

    projectedTotalPoints,
    projectedGoalsFor,
    projectedGoalsAgainst,
    pointsRate,
    goalDifference,

    scoring,

    isReady,
  }
}
