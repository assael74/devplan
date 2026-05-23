// src/shared/teams/expectations/expectations.utils.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Utils
|--------------------------------------------------------------------------
|
| אחריות:
| פונקציות עזר קטנות לשכבת ציפיות משחק.
*/

export const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

export const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback

  const n = Number(value)

  return Number.isFinite(n) ? n : fallback
}

export const safeDivide = ({
  value,
  total,
  fallback = 0,
}) => {
  const n = toNumber(value, null)
  const d = toNumber(total, 0)

  if (!Number.isFinite(n) || !d) return fallback

  return n / d
}

export const clampNumber = ({
  value,
  min,
  max,
}) => {
  const n = toNumber(value, 0)

  return Math.min(Math.max(n, min), max)
}

export const roundNumber = (value, digits = 2) => {
  const n = toNumber(value, 0)
  const factor = 10 ** digits

  return Math.round(n * factor) / factor
}

export const getGameObject = (row = {}) => {
  return row?.game || row
}
