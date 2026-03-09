// src/shared/stats/stats.helpers.js
export const safe = (v) => (v == null ? '' : String(v))

export const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

export const normalizeGameType = (g) => {
  if (!g) return 'friendly'
  const raw = g.type ?? g.gameType ?? g.meta?.type ?? ''
  const s = safe(raw).toLowerCase().trim()
  return s || 'friendly'
}

export const mostFrequent = (arr) => {
  if (!arr?.length) return null
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}
