// shared/games/insights/player/sections/teamContext/teamContext.evaluation.js

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

export function buildPlayerTeamContextEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      impact: buildEmptyEvaluation('missing_team_context'),
      primary: buildEmptyEvaluation('missing_team_context'),
      hasEnoughData: false,
    }
  }

  if (!metrics.hasWithData || !metrics.hasWithoutData) {
    const partial = {
      status: 'partial',
      label: 'מדגם חלקי',
      tone: 'neutral',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: false,
    }

    return {
      impact: partial,
      primary: partial,
      hasEnoughData: false,
    }
  }

  const gap = Number(metrics.pointsRateGap)

  if (gap >= 12) {
    const impact = {
      status: metrics.hasEnoughData ? 'strong_positive' : 'positive_caution',
      label: metrics.hasEnoughData ? 'השפעה חיובית' : 'כיוון חיובי',
      tone: 'success',
      isGreen: true,
      isWatch: !metrics.hasEnoughData,
      isRed: false,
      isPositive: true,
      isNegative: false,
    }

    return {
      impact,
      primary: impact,
      hasEnoughData: metrics.hasEnoughData,
    }
  }

  if (gap <= -12) {
    const impact = {
      status: metrics.hasEnoughData ? 'strong_negative' : 'negative_caution',
      label: metrics.hasEnoughData ? 'פער שלילי' : 'כיוון שלילי',
      tone: metrics.hasEnoughData ? 'warning' : 'neutral',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: true,
    }

    return {
      impact,
      primary: impact,
      hasEnoughData: metrics.hasEnoughData,
    }
  }

  const impact = {
    status: 'neutral',
    label: 'פער מתון',
    tone: 'neutral',
    isGreen: false,
    isWatch: true,
    isRed: false,
    isPositive: false,
    isNegative: false,
  }

  return {
    impact,
    primary: impact,
    hasEnoughData: metrics.hasEnoughData,
  }
}
