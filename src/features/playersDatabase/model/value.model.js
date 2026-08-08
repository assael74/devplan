// features/playersDatabase/model/value.model.js

export const cleanValue = value => {
  const safeValue = value === null || value === undefined
    ? ''
    : value

  return String(safeValue).trim()
}

export const hasValue = value => {
  return (
    value !== undefined &&
    value !== null &&
    cleanValue(value) !== ''
  )
}

export const pickFirstValue = (...values) => {
  const match = values.find(hasValue)

  return match === undefined ? '' : match
}

export const pickDefinedValue = (...values) => {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    const isLast = index === values.length - 1

    if (isLast || (value !== null && value !== undefined)) {
      return value
    }
  }

  return undefined
}

export const toNumberOrZero = value => {
  const nextValue = Number(value)

  return Number.isFinite(nextValue) ? nextValue : 0
}

export const toPositiveNumberOrFallback = (value, fallback = 0) => {
  const nextValue = toNumberOrZero(value)

  return nextValue > 0 ? nextValue : fallback
}
