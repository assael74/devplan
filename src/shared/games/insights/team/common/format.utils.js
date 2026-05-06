// shared/games/insights/team/common/format.utils.js

import { hasNumber, roundNumber } from './number.utils.js'

export function formatPercent(value) {
  if (!hasNumber(value)) return '—'

  return `${Math.round(Number(value))}%`
}

export function formatNumber(value, digits = 0) {
  if (!hasNumber(value)) return '—'

  return String(roundNumber(value, digits))
}

export function formatTargetGoals(value) {
  if (!hasNumber(value)) {
    return 'יעד שערי הזכות שהוגדר'
  }

  return `כ־${formatNumber(value)} שערי זכות`
}

export function formatTargetRange(target) {
  if (Array.isArray(target?.greenRange)) {
    return `${target.greenRange[0]}%–${target.greenRange[1]}%`
  }

  return '—'
}
