// shared/games/insights/player/sections/usage/usage.evaluation.js

import {
  hasNumber,
  roundNumber,
} from '../../../team/common/index.js'

function buildEmptyUsageEvaluation(reason = 'missing_data') {
  return {
    status: 'empty',
    label: 'אין נתונים',
    tone: 'neutral',
    reason,

    isGreen: false,
    isWatch: false,
    isRed: false,
    isOverTarget: false,
    isUnderTarget: false,
    isInsideTarget: false,
  }
}

function evaluateRangeFit({
  value,
  min,
  max,
  allowOverTarget = false,
}) {
  if (!hasNumber(value) || !hasNumber(min) || !hasNumber(max)) {
    return buildEmptyUsageEvaluation('missing_range')
  }

  const current = Number(value)
  const targetMin = Number(min)
  const targetMax = Number(max)

  const gapFromMin = roundNumber(current - targetMin, 1)
  const gapFromMax = roundNumber(current - targetMax, 1)

  if (current >= targetMin && current <= targetMax) {
    return {
      status: 'green',
      label: 'תואם יעד',
      tone: 'success',
      value: current,
      min: targetMin,
      max: targetMax,
      gapFromMin,
      gapFromMax,

      isGreen: true,
      isWatch: false,
      isRed: false,
      isOverTarget: false,
      isUnderTarget: false,
      isInsideTarget: true,
    }
  }

  if (current > targetMax) {
    return {
      status: allowOverTarget ? 'positive_over' : 'watch_over',
      label: allowOverTarget ? 'מעל יעד' : 'חריגה מעל יעד',
      tone: allowOverTarget ? 'success' : 'warning',
      value: current,
      min: targetMin,
      max: targetMax,
      gapFromMin,
      gapFromMax,

      isGreen: allowOverTarget,
      isWatch: !allowOverTarget,
      isRed: false,
      isOverTarget: true,
      isUnderTarget: false,
      isInsideTarget: false,
    }
  }

  const strongUnder = current < targetMin * 0.7

  return {
    status: strongUnder ? 'red_under' : 'watch_under',
    label: strongUnder ? 'מתחת משמעותית' : 'מתחת יעד',
    tone: strongUnder ? 'danger' : 'warning',
    value: current,
    min: targetMin,
    max: targetMax,
    gapFromMin,
    gapFromMax,

    isGreen: false,
    isWatch: !strongUnder,
    isRed: strongUnder,
    isOverTarget: false,
    isUnderTarget: true,
    isInsideTarget: false,
  }
}

function shouldAllowOverTarget(roleId) {
  return roleId === 'rotation' || roleId === 'fringe'
}

export function buildPlayerUsageEvaluation(metrics = {}) {
  if (!metrics.hasAnyData) {
    return {
      minutes: buildEmptyUsageEvaluation('missing_usage_data'),
      starts: buildEmptyUsageEvaluation('missing_usage_data'),
      primary: buildEmptyUsageEvaluation('missing_usage_data'),
      hasEnoughData: false,
    }
  }

  if (!metrics.hasRoleTarget) {
    return {
      minutes: buildEmptyUsageEvaluation('missing_role_target'),
      starts: buildEmptyUsageEvaluation('missing_role_target'),
      primary: buildEmptyUsageEvaluation('missing_role_target'),
      hasEnoughData: metrics.hasAnyData,
    }
  }

  const allowOverTarget = shouldAllowOverTarget(metrics.role?.id)

  const minutes = evaluateRangeFit({
    value: metrics.minutesPct,
    min: metrics.minutesTargetMin,
    max: metrics.minutesTargetMax,
    allowOverTarget,
  })

  const starts = evaluateRangeFit({
    value: metrics.startsPctFromTeamGames,
    min: metrics.startsTargetMin,
    max: metrics.startsTargetMax,
    allowOverTarget,
  })

  const primary = minutes.status !== 'empty'
    ? minutes
    : starts

  return {
    minutes,
    starts,
    primary,
    hasEnoughData: metrics.hasAnyData,
  }
}
