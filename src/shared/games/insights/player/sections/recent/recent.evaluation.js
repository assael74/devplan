// shared/games/insights/player/sections/recent/recent.evaluation.js

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

export function buildPlayerRecentEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      trend: buildEmptyEvaluation('missing_recent_data'),
      primary: buildEmptyEvaluation('missing_recent_data'),
      hasEnoughData: false,
    }
  }

  if (!metrics.hasEnoughData) {
    const trend = {
      status: 'sample_caution',
      label: 'מדגם נמוך',
      tone: 'neutral',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: false,
    }

    return {
      trend,
      primary: trend,
      hasEnoughData: false,
    }
  }

  if (metrics.contributionsPerGame >= 0.45) {
    const trend = {
      status: 'positive_form',
      label: 'מומנטום חיובי',
      tone: 'success',
      isGreen: true,
      isWatch: false,
      isRed: false,
      isPositive: true,
      isNegative: false,
    }

    return {
      trend,
      primary: trend,
      hasEnoughData: true,
    }
  }

  if (metrics.contributionsPerGame === 0 && metrics.sampleSize >= 4) {
    const trend = {
      status: 'quiet_form',
      label: 'רצף שקט',
      tone: 'warning',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: true,
    }

    return {
      trend,
      primary: trend,
      hasEnoughData: true,
    }
  }

  const trend = {
    status: 'stable',
    label: 'מגמה יציבה',
    tone: 'neutral',
    isGreen: false,
    isWatch: true,
    isRed: false,
    isPositive: false,
    isNegative: false,
  }

  return {
    trend,
    primary: trend,
    hasEnoughData: true,
  }
}
