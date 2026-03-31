// shared/abilities/abilities.utils.js

export const ABILITIES_SCORE_HEX = {
  elite: '#9ee008',
  strong: '#6fcf4f',
  good: '#b7d84b',
  medium: '#f2c94c',
  weak: '#f2994a',
  low: '#eb5757',
  neutral: '#d7dce3',
}

export function getAbilityScoreHex(score) {
  const n = Number(score)

  if (!Number.isFinite(n)) return ABILITIES_SCORE_HEX.neutral
  if (n >= 4.5) return ABILITIES_SCORE_HEX.elite
  if (n >= 4.0) return ABILITIES_SCORE_HEX.strong
  if (n >= 3.5) return ABILITIES_SCORE_HEX.good
  if (n >= 3.0) return ABILITIES_SCORE_HEX.medium
  if (n >= 2.0) return ABILITIES_SCORE_HEX.weak
  return ABILITIES_SCORE_HEX.low
}

export function getAbilityGapHex(gap) {
  const n = Number(gap)

  if (!Number.isFinite(n)) return ABILITIES_SCORE_HEX.neutral
  if (n >= 1.0) return ABILITIES_SCORE_HEX.elite
  if (n >= 0.5) return ABILITIES_SCORE_HEX.strong
  if (n > 0) return ABILITIES_SCORE_HEX.medium
  return '#b8c1cc'
}

export function getAbilitySemanticHex(color) {
  switch (String(color || '')) {
    case 'success':
      return ABILITIES_SCORE_HEX.strong
    case 'primary':
      return '#4f8cff'
    case 'warning':
      return ABILITIES_SCORE_HEX.medium
    case 'danger':
      return ABILITIES_SCORE_HEX.low
    default:
      return ABILITIES_SCORE_HEX.neutral
  }
}

export function toNum(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// מדיניות: 0 = לא דורג
export function isRated(v) {
  return toNum(v, 0) > 0
}

// עיגול יציב (מונע זנבות floating)
export function roundTo(n, digits = 1) {
  const x = Number(n)
  if (!Number.isFinite(x)) return null
  const p = Math.pow(10, digits)
  return Math.round((x + Number.EPSILON) * p) / p
}

export function safeStr(v) {
  return v == null ? '' : String(v)
}

// צבע לפי ציון (שימוש רוחבי)
export function scoreColor(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 4) return 'success'
  if (n >= 3) return 'primary'
  if (n > 0) return 'warning'
  return 'neutral'
}

// פורמט "מקסימום ספרה אחת" (2.3) + הסרת ".0"
export function fmtScore(v) {
  const n = roundTo(v, 1)
  if (n == null || !Number.isFinite(Number(n))) return '—'
  const s = String(Number(n).toFixed(1))
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

export function buildDomainsMeta(list = []) {
  const meta = {}
  for (const { domain, domainLabel } of list) {
    if (!domain) continue
    if (!meta[domain]) meta[domain] = { domain, domainLabel }
  }
  return meta
}
