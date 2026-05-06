// shared/games/insights/player/sections/difficulty/difficulty.metrics.js

import {
  pickNumber,
  roundNumber,
} from '../../../team/common/index.js'

function getDifficultySource(insights = {}) {
  return insights?.teamContext?.difficulty || []
}

function normalizeBucket(bucket = {}) {
  const player = bucket.player || {}
  const team = bucket.team || {}

  return {
    id: bucket.id || '',
    label:
      bucket.id === 'easy'
        ? 'רמה קלה'
        : bucket.id === 'equal'
          ? 'אותה רמה'
          : bucket.id === 'hard'
            ? 'רמה קשה'
            : bucket.id || '',

    minutes: pickNumber(bucket, ['minutes'], 0),

    playerGames: pickNumber(player, ['games'], 0),
    playerPointsRate: pickNumber(player, ['pointsRate'], 0),
    playerPointsPerGame: pickNumber(player, ['pointsPerGame'], 0),

    teamGames: pickNumber(team, ['games'], 0),
    teamPointsRate: pickNumber(team, ['pointsRate'], 0),
    teamPointsPerGame: pickNumber(team, ['pointsPerGame'], 0),

    pointsRateGap: pickNumber(bucket, ['pointsRateGap'], 0),
  }
}

export function buildPlayerDifficultyMetrics(insights = {}) {
  const source = getDifficultySource(insights)

  const buckets = ['easy', 'equal', 'hard'].map((id) => {
    const found = source.find((item) => item.id === id) || { id }
    return normalizeBucket(found)
  })

  const available = buckets.filter((bucket) => {
    return bucket.playerGames > 0 || bucket.minutes > 0
  })

  const best = available.reduce((bestBucket, bucket) => {
    if (!bestBucket) return bucket
    return bucket.pointsRateGap > bestBucket.pointsRateGap ? bucket : bestBucket
  }, null)

  const worst = available.reduce((worstBucket, bucket) => {
    if (!worstBucket) return bucket
    return bucket.pointsRateGap < worstBucket.pointsRateGap ? bucket : worstBucket
  }, null)

  const rates = available.map((bucket) => bucket.playerPointsRate)
  const maxRate = rates.length ? Math.max(...rates) : 0
  const minRate = rates.length ? Math.min(...rates) : 0

  return {
    source,

    easy: buckets[0],
    equal: buckets[1],
    hard: buckets[2],

    buckets,
    available,
    best,
    worst,

    totalPlayerGames: available.reduce((sum, bucket) => {
      return sum + bucket.playerGames
    }, 0),

    totalMinutes: available.reduce((sum, bucket) => {
      return sum + bucket.minutes
    }, 0),

    gap: roundNumber(maxRate - minRate, 1),

    hasEasyData: buckets[0].playerGames > 0,
    hasEqualData: buckets[1].playerGames > 0,
    hasHardData: buckets[2].playerGames > 0,
    hasAnyData: available.length > 0,
    hasFullProfile: available.length >= 2,
  }
}
