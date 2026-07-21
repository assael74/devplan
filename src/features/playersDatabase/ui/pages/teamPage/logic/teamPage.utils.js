// features/playersDatabase/ui/pages/teamPage/logic/teamPage.utils.js

export const clean = value => String(value ?? '').trim()

export const toNumber = value => Number(clean(value).replace(/,/g, '')) || 0

export const isSmallIndex = value => {
  const nextValue = Number(clean(value))
  return Number.isInteger(nextValue) && nextValue > 0 && nextValue <= 200
}

export const getOptionLabel = (options, value) => {
  const cleanValue = clean(value)
  if (!cleanValue) return 'ללא'

  return options.find(option => option.value === cleanValue)?.label || cleanValue
}

export const hasOptionValue = (options, value) =>
  options.some(option => option.value === clean(value))

export const formatRate = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return `${Math.round(numberValue)}%`
}

export const formatValue = value => {
  if (value === null || value === undefined || value === '') return '-'

  return value
}
