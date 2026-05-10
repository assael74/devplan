// src/shared/players/targets/playerTargets.chips.js

const isValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const formatPlayerTargetValue = (value, suffix = '') => {
  if (!isValue(value)) return '—'
  return `${value}${suffix}`
}

export const formatPlayerTargetRange = (range = [], suffix = '') => {
  if (!Array.isArray(range)) return '—'

  const min = range[0]
  const max = range[1]

  if (!isValue(min) || !isValue(max)) return '—'

  return `${min}–${max}${suffix}`
}

export const formatPlayerTargetRangeObj = (rangeObj = {}, suffix = '') => {
  if (!rangeObj || typeof rangeObj !== 'object') return '—'

  const min = rangeObj.min
  const max = rangeObj.max

  if (!isValue(min) || !isValue(max)) return '—'

  return `${min}–${max}${suffix}`
}

export const buildLowHighChips = ({
  min,
  max,
  suffix = '',
  minLabel = 'מתחת',
  maxLabel = 'יעד',
} = {}) => {
  const chips = []

  if (isValue(min)) {
    chips.push({
      id: 'low',
      color: 'danger',
      variant: 'soft',
      label: `${minLabel} ${min}${suffix}`,
    })
  }

  if (isValue(max)) {
    chips.push({
      id: 'high',
      color: 'success',
      variant: 'soft',
      label: `${maxLabel} ${max}${suffix}`,
    })
  }

  return chips
}

export const buildRangeThresholdChips = ({
  range = [],
  suffix = '',
  minLabel = 'מתחת',
  maxLabel = 'יעד',
} = {}) => {
  if (!Array.isArray(range)) return []

  return buildLowHighChips({
    min: range[0],
    max: range[1],
    suffix,
    minLabel,
    maxLabel,
  })
}

export const buildRangeObjThresholdChips = ({
  rangeObj = {},
  suffix = '',
  minLabel = 'מתחת',
  maxLabel = 'יעד',
} = {}) => {
  return buildLowHighChips({
    min: rangeObj?.min,
    max: rangeObj?.max,
    suffix,
    minLabel,
    maxLabel,
  })
}

export const buildSingleTargetChips = ({
  value,
  suffix = '',
  label = 'יעד',
} = {}) => {
  if (!isValue(value)) return []

  return [
    {
      id: 'target',
      color: 'success',
      variant: 'soft',
      label: `${label} ${value}${suffix}`,
    },
  ]
}

export const buildPctThresholdChips = ({
  greenMin,
  redBelow,
  suffix = '%',
} = {}) => {
  const chips = []

  if (isValue(redBelow)) {
    chips.push({
      id: 'redBelow',
      color: 'danger',
      variant: 'soft',
      label: `מתחת ${redBelow}${suffix}`,
    })
  }

  if (isValue(greenMin)) {
    chips.push({
      id: 'greenMin',
      color: 'success',
      variant: 'soft',
      label: `מ־${greenMin}${suffix}`,
    })
  }

  return chips
}

export const resolveActualColorByChips = ({
  actual,
  chips = [],
}) => {
  const n = toNumber(actual)

  if (!Number.isFinite(n)) return 'neutral'

  const lowChip = chips.find((chip) => chip.id === 'low' || chip.id === 'redBelow')
  const highChip = chips.find((chip) => chip.id === 'high' || chip.id === 'greenMin' || chip.id === 'target')

  if (lowChip) {
    const lowValue = toNumber(String(lowChip.label).match(/-?\d+(\.\d+)?/)?.[0])
    if (Number.isFinite(lowValue) && n < lowValue) return 'danger'
  }

  if (highChip) {
    const highValue = toNumber(String(highChip.label).match(/-?\d+(\.\d+)?/)?.[0])
    if (Number.isFinite(highValue) && n >= highValue) return 'success'
  }

  return 'warning'
}
