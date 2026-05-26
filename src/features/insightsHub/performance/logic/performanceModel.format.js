// features/insightsHub/performance/logic/performanceModel.format.js

export const emptyText = '—'

export const formatRange = (range = []) => {
  if (!Array.isArray(range) || range.length < 2) return emptyText

  return `${range[0]}–${range[1]}`
}

export const formatValue = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') return emptyText

  return `${value}${suffix}`
}

export const pctValue = value => {
  const n = Number(value)

  if (!Number.isFinite(n)) return emptyText

  return `${Math.round(n * 100)}%`
}

export const roundText = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return emptyText

  return n > 0
    ? `+${n.toFixed(digits)}`
    : n.toFixed(digits)
}
