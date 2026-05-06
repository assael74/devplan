// shared/games/insights/team/common/evaluation.utils.js

import { hasNumber } from './number.utils.js'

export function buildEmptyEvaluation() {
  return {
    status: 'empty',
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: false,
  }
}

export function evaluateHigherIsBetter(value, target) {
  if (!target || !hasNumber(value)) return buildEmptyEvaluation()

  const n = Number(value)

  if (hasNumber(target.greenMin) && n >= Number(target.greenMin)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redBelow) && n < Number(target.redBelow)) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

export function evaluateLowerIsBetter(value, target) {
  if (!target || !hasNumber(value)) return buildEmptyEvaluation()

  const n = Number(value)

  if (hasNumber(target.greenMax) && n <= Number(target.greenMax)) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (hasNumber(target.redAbove) && n > Number(target.redAbove)) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}

export function evaluateRange(value, target) {
  if (!target || !hasNumber(value)) return buildEmptyEvaluation()

  const n = Number(value)
  const min = Array.isArray(target.greenRange)
    ? Number(target.greenRange[0])
    : null
  const max = Array.isArray(target.greenRange)
    ? Number(target.greenRange[1])
    : null

  if (Number.isFinite(min) && Number.isFinite(max) && n >= min && n <= max) {
    return {
      status: 'green',
      tone: 'success',
      isGreen: true,
      isRed: false,
      isWatch: false,
    }
  }

  if (
    (hasNumber(target.redBelow) && n < Number(target.redBelow)) ||
    (hasNumber(target.redAbove) && n > Number(target.redAbove))
  ) {
    return {
      status: 'red',
      tone: 'warning',
      isGreen: false,
      isRed: true,
      isWatch: false,
    }
  }

  return {
    status: 'watch',
    tone: 'neutral',
    isGreen: false,
    isRed: false,
    isWatch: true,
  }
}
