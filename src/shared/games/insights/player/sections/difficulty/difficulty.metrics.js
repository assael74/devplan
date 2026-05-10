// shared/games/insights/player/sections/difficulty/difficulty.metrics.js

import {
  pickNumber,
  roundNumber,
} from '../../../team/common/index.js'

function getDifficultySource(insights = {}) {
  return insights?.teamContext?.difficulty || []
}

function getBucketLabel(id = '') {
  if (id === 'easy') return 'רמה קלה'
  if (id === 'equal') return 'אותה רמה'
  if (id === 'hard') return 'רמה קשה'

  return id || ''
}

function normalizeBucket(bucket = {}) {
  const withPlayer = bucket.withPlayer || bucket.player || {}
  const withoutPlayer = bucket.withoutPlayer || {}
  const team = bucket.team || {}
  const games = bucket.games || {}

  return {
    id: bucket.id || '',
    label: getBucketLabel(bucket.id),

    minutes: pickNumber(bucket, ['minutes'], 0),

    withPlayer,
    withoutPlayer,
    team,
    games,

    // compat
    player: withPlayer,

    playerGames: pickNumber(withPlayer, ['games'], 0),
    playerPoints: pickNumber(withPlayer, ['points'], 0),
    playerMaxPoints: pickNumber(withPlayer, ['maxPoints'], 0),
    playerPointsRate: pickNumber(withPlayer, ['pointsRate'], 0),
    playerPointsPerGame: pickNumber(withPlayer, ['pointsPerGame'], 0),

    withoutPlayerGames: pickNumber(withoutPlayer, ['games'], 0),
    withoutPlayerPoints: pickNumber(withoutPlayer, ['points'], 0),
    withoutPlayerMaxPoints: pickNumber(withoutPlayer, ['maxPoints'], 0),
    withoutPlayerPointsRate: pickNumber(withoutPlayer, ['pointsRate'], 0),
    withoutPlayerPointsPerGame: pickNumber(withoutPlayer, ['pointsPerGame'], 0),

    teamGames: pickNumber(team, ['games'], 0),
    teamPoints: pickNumber(team, ['points'], 0),
    teamMaxPoints: pickNumber(team, ['maxPoints'], 0),
    teamPointsRate: pickNumber(team, ['pointsRate'], 0),
    teamPointsPerGame: pickNumber(team, ['pointsPerGame'], 0),

    pointsRateGap: pickNumber(bucket, ['pointsRateGap'], 0),
    pointsPerGameGap: pickNumber(bucket, ['pointsPerGameGap'], 0),

    raw: bucket,
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

    return bucket.pointsRateGap > bestBucket.pointsRateGap
      ? bucket
      : bestBucket
  }, null)

  const worst = available.reduce((worstBucket, bucket) => {
    if (!worstBucket) return bucket

    return bucket.pointsRateGap < worstBucket.pointsRateGap
      ? bucket
      : worstBucket
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
