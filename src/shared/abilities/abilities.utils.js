// shared/abilities/abilities.utils.js

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
