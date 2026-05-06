// shared/games/insights/team/sections/difficulty/difficulty.evaluation.js

import {
  hasNumber,
  roundNumber,
} from '../../common/index.js'

import { getTeamGamesDifficultyTargetsByLevelId } from '../../targets/teamTargets.selectors.js'

const MIN_GAMES_FOR_STRONG_INSIGHT = 2

const FALLBACK_DIFFICULTY_TARGETS = {
  easy: { targetRate: 60 },
  equal: { targetRate: 45 },
  hard: { targetRate: 25 },
}

const DIFFICULTY_DEVIATION_RULES = {
  easy: {
    greenMin: 5,
    neutralMin: -2,
    orangeMin: -6,
    redMin: -12,
    strongRedBelow: -13,
  },
  equal: {
    greenMin: 6,
    neutralMin: -3,
    orangeMin: -8,
    redMin: -14,
    strongRedBelow: -15,
  },
  hard: {
    greenMin: 7,
    neutralMin: -5,
    orangeMin: -10,
    redMin: -17,
    strongRedBelow: -18,
  },
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

function resolveTargetProfile(insights = {}) {
  return insights.targetProfile || insights.benchmarkLevel || null
}

export function getDifficultyReliability(games) {
  const count = Number(games) || 0

  if (count <= 0) {
    return {
      id: 'none',
      label: 'אין נתונים',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 2) {
    return {
      id: 'low',
      label: 'מדגם נמוך',
      tone: 'neutral',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 4) {
    return {
      id: 'medium',
      label: 'מדגם זהיר',
      tone: 'primary',
      canUseStrongFlag: false,
      caution: true,
    }
  }

  if (count <= 7) {
    return {
      id: 'normal',
      label: 'מדגם רגיל',
      tone: 'primary',
      canUseStrongFlag: true,
      caution: false,
    }
  }

  return {
    id: 'high',
    label: 'מדגם גבוה',
    tone: 'success',
    canUseStrongFlag: true,
    caution: false,
  }
}

export function evaluateDifficultyDeviation({
  id,
  actualRate,
  targetRate,
  games,
}) {
  const reliability = getDifficultyReliability(games)

  if (!hasNumber(actualRate) || !hasNumber(targetRate) || games <= 0) {
    return {
      status: 'empty',
      label: 'אין נתונים',
      tone: 'neutral',
      targetRate,
      actualRate,
      deviation: null,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: false,
      isStrong: false,
      isNegative: false,
      isPositive: false,
    }
  }

  const rules = DIFFICULTY_DEVIATION_RULES[id] || DIFFICULTY_DEVIATION_RULES.equal
  const deviation = roundNumber(Number(actualRate) - Number(targetRate), 1)

  if (deviation >= rules.greenMin) {
    const isStrong =
      reliability.canUseStrongFlag && deviation >= rules.greenMin + 5

    return {
      status: isStrong ? 'strong_green' : 'green',
      label: isStrong ? 'ירוק חזק' : 'ירוק',
      tone: 'success',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: true,
      isOrange: false,
      isRed: false,
      isStrong,
      isNegative: false,
      isPositive: true,
    }
  }

  if (deviation >= rules.neutralMin) {
    return {
      status: 'neutral',
      label: 'תקין',
      tone: 'neutral',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: false,
      isStrong: false,
      isNegative: false,
      isPositive: false,
    }
  }

  if (deviation >= rules.orangeMin) {
    return {
      status: 'orange',
      label: 'כתום',
      tone: 'warning',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: true,
      isRed: false,
      isStrong: false,
      isNegative: true,
      isPositive: false,
    }
  }

  if (deviation >= rules.redMin) {
    return {
      status: 'red',
      label: 'אדום',
      tone: 'danger',
      targetRate,
      actualRate,
      deviation,
      reliability,
      isGreen: false,
      isOrange: false,
      isRed: true,
      isStrong: false,
      isNegative: true,
      isPositive: false,
    }
  }

  const isStrong =
    reliability.canUseStrongFlag && deviation <= rules.strongRedBelow

  return {
    status: isStrong ? 'strong_red' : 'red',
    label: isStrong ? 'אדום חזק' : 'אדום',
    tone: 'danger',
    targetRate,
    actualRate,
    deviation,
    reliability,
    isGreen: false,
    isOrange: false,
    isRed: true,
    isStrong,
    isNegative: true,
    isPositive: false,
  }
}

function enrichBucket(bucket, targets) {
  const targetRate = targets?.[bucket.id]?.targetRate

  const evaluation = evaluateDifficultyDeviation({
    id: bucket.id,
    actualRate: bucket.pointsRate,
    targetRate,
    games: bucket.games,
  })

  return {
    ...bucket,
    targetRate,
    deviation: evaluation.deviation,
    evaluation,
  }
}

export function buildDifficultyEvaluation(metrics, insights = {}) {
  const targetProfile = resolveTargetProfile(insights)
  const targets =
    getTeamGamesDifficultyTargetsByLevelId(targetProfile?.id) ||
    FALLBACK_DIFFICULTY_TARGETS

  const buckets = metrics.buckets.map((bucket) => {
    return enrichBucket(bucket, targets)
  })

  const available = buckets.filter((bucket) => bucket.games > 0)

  const strongestPositive = available.reduce((bestBucket, bucket) => {
    if (!bucket?.evaluation?.isPositive) return bestBucket
    if (!bestBucket) return bucket
    return bucket.deviation > bestBucket.deviation ? bucket : bestBucket
  }, null)

  const strongestNegative = available.reduce((worstBucket, bucket) => {
    if (!bucket?.evaluation?.isNegative) return worstBucket
    if (!worstBucket) return bucket
    return bucket.deviation < worstBucket.deviation ? bucket : worstBucket
  }, null)

  const hasEnoughData = available.some((bucket) => {
    return bucket.games >= MIN_GAMES_FOR_STRONG_INSIGHT
  })

  return {
    targetProfile,
    targetLevel: targetProfile,
    targetLevelId: targetProfile?.id || null,
    targetLabel: getLevelLabel(targetProfile),
    targets,
    hasSpecificTargets: Boolean(targetProfile?.id),

    buckets,
    available,
    easy: buckets[0],
    equal: buckets[1],
    hard: buckets[2],

    strongestPositive,
    strongestNegative,

    hasEnoughData,
    hasFullProfile: available.length >= 2,
  }
}
