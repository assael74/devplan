// shared/games/insights/team/sections/difficulty/difficulty.metrics.js

import {
  calcPercent,
  pickNumber,
  roundNumber,
} from '../../common/index.js'

import {
  getDifficultyBucket,
  resolveDifficultySource,
} from './difficulty.sources.js'

function normalizeBucket(bucket) {
  if (!bucket) {
    return {
      games: 0,
      points: 0,
      maxPoints: 0,
      pointsRate: 0,
      remainingGames: 0,
      projectedPoints: 0,
      color: 'neutral',
    }
  }

  const games = pickNumber(
    bucket,
    ['games', 'gamesCount', 'count', 'playedGames', 'playedGamesCount', 'total'],
    0
  )

  const points = pickNumber(bucket, ['points', 'value'], 0)

  const maxPoints = pickNumber(
    bucket,
    ['maxPoints', 'possiblePoints', 'totalMaxPoints'],
    games * 3
  )

  const pointsRate = pickNumber(
    bucket,
    ['pointsRate', 'pointsPct', 'rate', 'percent', 'pct'],
    calcPercent(points, maxPoints)
  )

  const remainingGames = pickNumber(
    bucket,
    ['remainingGames', 'remainingGamesCount', 'upcomingGames', 'upcomingCount'],
    0
  )

  const projectedPoints = pickNumber(
    bucket,
    ['projectedPoints', 'projection', 'projectedTotalPoints'],
    points
  )

  return {
    games,
    points,
    maxPoints,
    pointsRate,
    remainingGames,
    projectedPoints,
    color: bucket.color || 'neutral',
  }
}

function buildDifficultyBucket({ id, label, shortLabel, meaning, source }) {
  return {
    id,
    label,
    shortLabel,
    meaning,
    ...normalizeBucket(getDifficultyBucket(source, id)),
  }
}

export function buildDifficultyMetrics(insights = {}) {
  const source = resolveDifficultySource(insights)

  const buckets = [
    buildDifficultyBucket({
      id: 'easy',
      label: 'רמה קלה',
      shortLabel: 'קלות',
      meaning: 'ניצול יתרון',
      source,
    }),
    buildDifficultyBucket({
      id: 'equal',
      label: 'אותה רמה',
      shortLabel: 'שוות',
      meaning: 'תחרותיות ישירה',
      source,
    }),
    buildDifficultyBucket({
      id: 'hard',
      label: 'רמה קשה',
      shortLabel: 'קשות',
      meaning: 'התמודדות עם קושי גבוה',
      source,
    }),
  ]

  const available = buckets.filter((bucket) => bucket.games > 0)
  const totalGames = available.reduce((sum, bucket) => sum + bucket.games, 0)

  const rates = available.map((bucket) => bucket.pointsRate)
  const maxRate = rates.length ? Math.max(...rates) : 0
  const minRate = rates.length ? Math.min(...rates) : 0
  const gap = roundNumber(maxRate - minRate, 1)

  const best = available.reduce((bestBucket, bucket) => {
    if (!bestBucket) return bucket
    return bucket.pointsRate > bestBucket.pointsRate ? bucket : bestBucket
  }, null)

  const worst = available.reduce((worstBucket, bucket) => {
    if (!worstBucket) return bucket
    return bucket.pointsRate < worstBucket.pointsRate ? bucket : worstBucket
  }, null)

  return {
    source,

    easy: buckets[0],
    equal: buckets[1],
    hard: buckets[2],

    buckets,
    available,
    best,
    worst,

    totalGames,
    gap,
    absGap: Math.abs(gap),

    hasEasyData: buckets[0].games > 0,
    hasEqualData: buckets[1].games > 0,
    hasHardData: buckets[2].games > 0,
    hasAnyData: totalGames > 0,
    hasFullProfile: available.length >= 2,
  }
}
