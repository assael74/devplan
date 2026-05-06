// playerProfile/sharedLogic/games/insightsDrawer/common/view.shared.js

export const EMPTY = '—'

export const toNum = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export const toText = (value, fallback = EMPTY) => {
  if (value === undefined || value === null || value === '') return fallback
  return String(value)
}

export const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

export const round1 = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * 10) / 10
}

export const round2 = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.round(number * 100) / 100
}

export const formatPercent = (value, fallback = EMPTY) => {
  if (!hasValue(value)) return fallback
  return `${Math.round(toNum(value))}%`
}

export const formatNumber = (value, digits = 0, fallback = EMPTY) => {
  if (!hasValue(value)) return fallback

  if (digits === 2) return String(round2(value))
  if (digits === 1) return String(round1(value))

  return String(Math.round(toNum(value)))
}

export const resolveToneColor = (tone) => {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'danger') return 'danger'
  if (tone === 'primary') return 'primary'

  return 'neutral'
}

export const resolvePctColor = (pct) => {
  const value = toNum(pct)

  if (value >= 70) return 'success'
  if (value >= 45) return 'warning'
  if (value > 0) return 'danger'

  return 'neutral'
}
