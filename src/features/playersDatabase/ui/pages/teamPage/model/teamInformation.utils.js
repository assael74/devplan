export const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const withFallback = (value, fallback) => (
  value === undefined || value === null ? fallback : value
)

export const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null

  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

export const percent = value => {
  const next = numberOrNull(value)
  if (next === null) return null
  return next <= 1 ? Math.round(next * 100) : Math.round(next)
}

