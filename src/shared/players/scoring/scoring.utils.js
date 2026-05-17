// src/shared/players/scoring/scoring.utils.js

export const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

export const roundNumber = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return 0

  return Number(n.toFixed(digits))
}

export const roundScore = (value) => {
  return roundNumber(value, 1)
}

export const clampNumber = ({
  value,
  min,
  max,
}) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return min

  return Math.min(max, Math.max(min, n))
}

export const safeDivide = ({
  value,
  total,
  fallback = 0,
}) => {
  const n = Number(value)
  const t = Number(total)

  if (!Number.isFinite(n) || !Number.isFinite(t) || t <= 0) {
    return fallback
  }

  return n / t
}

export const perGameByMinutes = ({
  value,
  minutes,
  gameMinutes,
}) => {
  const n = toNumber(value, 0)
  const m = toNumber(minutes, 0)
  const gm = toNumber(gameMinutes, 0)

  if (m <= 0 || gm <= 0) return 0

  return (n / m) * gm
}
