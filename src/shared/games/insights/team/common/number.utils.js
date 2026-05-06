// shared/games/insights/team/common/number.utils.js

export function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function hasNumber(value) {
  return Number.isFinite(Number(value))
}

export function roundNumber(value, digits = 1) {
  const n = Number(value)

  if (!Number.isFinite(n)) return 0

  const factor = 10 ** digits
  return Math.round(n * factor) / factor
}

export function calcPercent(value, total) {
  const v = toNumber(value, 0)
  const t = toNumber(total, 0)

  if (!t) return 0

  return Math.round((v / t) * 100)
}

export function pickNumber(source, keys = [], fallback = 0) {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]

    if (hasNumber(value)) {
      return Number(value)
    }
  }

  return fallback
}

export function pickArray(source, keys = [], fallback = []) {
  if (!source) return fallback

  for (const key of keys) {
    const value = source[key]

    if (Array.isArray(value)) {
      return value
    }
  }

  return fallback
}
