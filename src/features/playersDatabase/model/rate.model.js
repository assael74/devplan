// Canonical presentation/persistence rounding for per-game pace values.
// Whole numbers intentionally remain whole ("3", not "3.0").
export const roundPerGameRate = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null
}

export const formatPerGameRate = (value, fallback = '-') => {
  const rounded = roundPerGameRate(value)
  return rounded === null ? fallback : String(rounded)
}
