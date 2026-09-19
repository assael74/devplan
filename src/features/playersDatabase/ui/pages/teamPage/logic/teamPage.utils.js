// src/features/playersDatabase/ui/pages/teamPage/logic/teamPage.utils.js

export const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const toNumber = value => Number(clean(value).replace(/,/g, '')) || 0

export const isSmallIndex = value => {
  const nextValue = Number(clean(value))
  return Number.isInteger(nextValue) && nextValue > 0 && nextValue <= 200
}

export const formatRate = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return `${Math.round(numberValue)}%`
}

export const formatScore = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return `${Math.round(numberValue)}`
}

export const formatValue = value => {
  if (value === null || value === undefined || value === '') return '-'

  return value
}
