// shared/games/insights/player/sections/roleFit/roleFit.evaluation.js

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

function evaluateTrustByRole(metrics = {}) {
  const roleId = metrics.role?.id

  if (!roleId) return buildEmptyEvaluation('missing_role')

  if (roleId === 'key') {
    if (metrics.hasEqualMinutes || metrics.hasHardMinutes) {
      return {
        status: 'trusted',
        label: 'אמון גבוה',
        tone: 'success',
        isGreen: true,
        isWatch: false,
        isRed: false,
        isPositive: true,
        isNegative: false,
      }
    }

    return {
      status: 'limited_trust',
      label: 'אמון מוגבל',
      tone: 'warning',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: true,
    }
  }

  if (roleId === 'core') {
    if (metrics.hasEqualMinutes) {
      return {
        status: 'core_trust',
        label: 'שימוש תחרותי',
        tone: 'success',
        isGreen: true,
        isWatch: false,
        isRed: false,
        isPositive: true,
        isNegative: false,
      }
    }

    return {
      status: 'soft_core',
      label: 'שימוש זהיר',
      tone: 'warning',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: true,
    }
  }

  if (roleId === 'rotation') {
    if (metrics.hasEqualMinutes || metrics.hasHardMinutes) {
      return {
        status: 'real_rotation',
        label: 'רוטציה אמיתית',
        tone: 'success',
        isGreen: true,
        isWatch: false,
        isRed: false,
        isPositive: true,
        isNegative: false,
      }
    }

    if (metrics.hasEasyMinutes) {
      return {
        status: 'soft_rotation',
        label: 'רוטציה מוגבלת',
        tone: 'neutral',
        isGreen: false,
        isWatch: true,
        isRed: false,
        isPositive: false,
        isNegative: false,
      }
    }
  }

  if (roleId === 'fringe') {
    if (metrics.hasEqualMinutes || metrics.hasHardMinutes) {
      return {
        status: 'above_fringe',
        label: 'מעל מעמד',
        tone: 'success',
        isGreen: true,
        isWatch: false,
        isRed: false,
        isPositive: true,
        isNegative: false,
      }
    }

    return {
      status: 'expected_fringe',
      label: 'שימוש מוגבל',
      tone: 'neutral',
      isGreen: false,
      isWatch: true,
      isRed: false,
      isPositive: false,
      isNegative: false,
    }
  }

  return buildEmptyEvaluation('unknown_role')
}

function evaluateUsageLevel(metrics = {}) {
  const roleTarget = metrics.roleTarget || {}
  const range = roleTarget.minutesRange || []

  const min = Number(range[0])
  const max = Number(range[1])
  const value = Number(metrics.minutesPct)

  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(value)) {
    return buildEmptyEvaluation('missing_minutes_target')
  }

  if (value >= min && value <= max) {
    return {
      status: 'fit',
      label: 'תואם מעמד',
      tone: 'success',
      isGreen: true,
      isWatch: false,
      isRed: false,
      isPositive: true,
      isNegative: false,
    }
  }

  if (value < min) {
    const strong = value < min * 0.7

    return {
      status: strong ? 'under_strong' : 'under',
      label: strong ? 'מתחת משמעותית' : 'מתחת מעמד',
      tone: strong ? 'danger' : 'warning',
      isGreen: false,
      isWatch: !strong,
      isRed: strong,
      isPositive: false,
      isNegative: true,
    }
  }

  return {
    status: 'above',
    label: 'מעל מעמד',
    tone: metrics.role?.id === 'key' || metrics.role?.id === 'core'
      ? 'warning'
      : 'success',
    isGreen: metrics.role?.id === 'rotation' || metrics.role?.id === 'fringe',
    isWatch: metrics.role?.id === 'key' || metrics.role?.id === 'core',
    isRed: false,
    isPositive: true,
    isNegative: false,
  }
}

export function buildPlayerRoleFitEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      usage: buildEmptyEvaluation('missing_data'),
      trust: buildEmptyEvaluation('missing_data'),
      primary: buildEmptyEvaluation('missing_data'),
      hasEnoughData: false,
    }
  }

  const usage = evaluateUsageLevel(metrics)
  const trust = evaluateTrustByRole(metrics)

  const primary = usage.isRed || usage.isWatch
    ? usage
    : trust.isWatch || trust.isRed
      ? trust
      : usage.isGreen
        ? usage
        : trust

  return {
    usage,
    trust,
    primary,
    hasEnoughData: metrics.hasAnyData,
  }
}
