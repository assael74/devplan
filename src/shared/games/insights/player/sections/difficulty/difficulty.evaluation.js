// shared/games/insights/player/sections/difficulty/difficulty.evaluation.js

function buildEmptyEvaluation(reason = 'missing_data') {
  return {
    status: 'empty',
    label: 'אין נתונים',
    tone: 'neutral',
    reason,

    isGreen: false,
    isWatch: false,
    isRed: false,
    isPositive: false,
    isNegative: false,
  }
}

function evaluateBucket(bucket = {}) {
  if (!bucket.playerGames) {
    return {
      ...bucket,
      evaluation: buildEmptyEvaluation('missing_bucket_data'),
    }
  }

  const gap = Number(bucket.pointsRateGap)

  if (gap >= 12) {
    return {
      ...bucket,
      evaluation: {
        status: 'positive',
        label: 'מעל קצב הקבוצה',
        tone: 'success',
        isGreen: true,
        isWatch: false,
        isRed: false,
        isPositive: true,
        isNegative: false,
      },
    }
  }

  if (gap <= -12) {
    return {
      ...bucket,
      evaluation: {
        status: 'negative',
        label: 'מתחת לקצב הקבוצה',
        tone: 'warning',
        isGreen: false,
        isWatch: true,
        isRed: false,
        isPositive: false,
        isNegative: true,
      },
    }
  }

  return {
    ...bucket,
    evaluation: {
      status: 'neutral',
      label: 'קרוב לקצב הקבוצה',
      tone: 'neutral',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: false,
    },
  }
}

export function buildPlayerDifficultyEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      buckets: [],
      strongestPositive: null,
      strongestNegative: null,
      primary: buildEmptyEvaluation('missing_difficulty_data'),
      hasEnoughData: false,
    }
  }

  const buckets = metrics.buckets.map(evaluateBucket)
  const available = buckets.filter((bucket) => bucket.playerGames > 0)

  const strongestPositive = available.reduce((bestBucket, bucket) => {
    if (!bucket?.evaluation?.isPositive) return bestBucket
    if (!bestBucket) return bucket
    return bucket.pointsRateGap > bestBucket.pointsRateGap ? bucket : bestBucket
  }, null)

  const strongestNegative = available.reduce((worstBucket, bucket) => {
    if (!bucket?.evaluation?.isNegative) return worstBucket
    if (!worstBucket) return bucket
    return bucket.pointsRateGap < worstBucket.pointsRateGap ? bucket : worstBucket
  }, null)

  const primary =
    strongestNegative?.evaluation ||
    strongestPositive?.evaluation ||
    available[0]?.evaluation ||
    buildEmptyEvaluation('missing_difficulty_data')

  return {
    buckets,
    available,
    strongestPositive,
    strongestNegative,
    primary,
    hasEnoughData: metrics.totalPlayerGames >= 3,
  }
}
