// features/playersDatabase/model/value.model.js

export const cleanValue = value => String(value ?? '').trim()

export const hasValue = value => (
  value !== undefined &&
  value !== null &&
  cleanValue(value) !== ''
)

export const pickFirstValue = (...values) => {
  const match = values.find(hasValue)

  return match === undefined ? '' : match
}

export const toNumberOrZero = value => {
  const nextValue = Number(value)

  return Number.isFinite(nextValue) ? nextValue : 0
}

export const toPositiveNumberOrFallback = (value, fallback = 0) => {
  const nextValue = toNumberOrZero(value)

  return nextValue > 0 ? nextValue : fallback
}
