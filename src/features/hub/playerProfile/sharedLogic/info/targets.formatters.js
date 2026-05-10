// features/hub/playerProfile/sharedLogic/info/targets.formatters.js

export const EMPTY = '—'

export const DEFENSIVE_LAYERS = [
  'dmMid',
  'defense',
  'goalkeeper',
]

export const isValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

export const toNumber = (value, fallback = null) => {
  const n = Number(value)

  if (Number.isFinite(n)) {
    return n
  }

  return fallback
}

export const pickNumber = (...values) => {
  for (let i = 0; i < values.length; i++) {
    const n = toNumber(values[i])

    if (Number.isFinite(n)) {
      return n
    }
  }

  return null
}

export const formatValue = (value, suffix = '') => {
  if (!isValue(value)) {
    return EMPTY
  }

  return `${value}${suffix}`
}

export const getRangeMin = (range) => {
  if (Array.isArray(range)) {
    return range[0]
  }

  if (range && typeof range === 'object') {
    return range.min
  }

  return null
}

export const getRangeMax = (range) => {
  if (Array.isArray(range)) {
    return range[1]
  }

  if (range && typeof range === 'object') {
    return range.max
  }

  return null
}

export const formatRange = ({
  range,
  suffix = '',
}) => {
  const min = getRangeMin(range)
  const max = getRangeMax(range)

  if (isValue(min) && isValue(max)) {
    return `${min}${suffix}–${max}${suffix}`
  }

  if (isValue(min)) {
    return `מעל ${min}${suffix}`
  }

  if (isValue(max)) {
    return `עד ${max}${suffix}`
  }

  return EMPTY
}

export const formatTargetValue = ({
  value,
  suffix = '',
}) => {
  if (!isValue(value)) {
    return EMPTY
  }

  return `${value}${suffix}`
}

export const isDefensivePlayer = (positionLayer) => {
  return DEFENSIVE_LAYERS.includes(positionLayer)
}
