// playerProfile/sharedLogic/games/insightsDrawer/tooltip/tooltip.shared.js

import {
  EMPTY,
  formatNumber,
  formatPercent,
  hasValue,
  round2,
  toNum,
} from '../common/index.js'

export const formatGap = (value, digits = 2) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return EMPTY
  if (number > 0) return `+${formatNumber(number, digits)}`
  if (number < 0) return formatNumber(number, digits)

  return '0'
}

export const formatValue = (value, fallback = EMPTY) => {
  if (!hasValue(value)) return fallback

  return String(value)
}

export const formatRate = (value, suffix = '') => {
  if (!hasValue(value)) return EMPTY

  const label = formatNumber(value, 2)

  return suffix ? `${label} ${suffix}` : label
}

export const row = ({ id, label, value, items }) => {
  if (Array.isArray(items)) {
    return {
      id,
      label,
      items,
    }
  }

  return {
    id,
    label,
    value: formatValue(value),
  }
}

export const pctRow = ({ id, label, value }) => {
  return row({
    id,
    label,
    value: formatPercent(value),
  })
}

export const numRow = ({ id, label, value, digits = 0, suffix = '' }) => {
  const text = formatNumber(value, digits)

  return row({
    id,
    label,
    value: suffix && text !== EMPTY ? `${text} ${suffix}` : text,
  })
}

export const gapRow = ({ id = 'gap', label = 'פער', value, digits = 2, suffix = '' }) => {
  const text = formatGap(value, digits)

  return row({
    id,
    label,
    value: suffix && text !== EMPTY ? `${text} ${suffix}` : text,
  })
}

export const calcRate = ({ value, minutes, gameTime, digits = 2 }) => {
  const v = toNum(value)
  const m = toNum(minutes)
  const t = toNum(gameTime, 90)

  if (m <= 0 || t <= 0) return 0

  return round2((v / m) * t, digits)
}

export const buildFormulaText = ({ value, minutes, gameTime, result }) => {
  return `${formatNumber(value)} / ${formatNumber(minutes)} × ${formatNumber(
    gameTime
  )} = ${formatNumber(result, 2)}`
}

export const compactRows = (rows = []) => {
  return rows.filter(Boolean)
}

export const tooltip = ({ title, rows = [] }) => {
  return {
    title,
    rows: compactRows(rows),
  }
}
