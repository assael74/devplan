// src/shared/format/direction.js

export const LRM = '\u200E'

export const formatLtr = value => {
  return `${LRM}${value}`
}

export const formatLtrNumber = (value, options = {}) => {
  const { dash = '-', suffix = '', signed = false } = options

  if (value === null || value === undefined || value === '') return dash

  const text = String(value).trim()
  if (!text) return dash

  if (!signed) return formatLtr(text)

  const number = Number(text)
  if (!Number.isFinite(number)) return formatLtr(text)

  const sign = number > 0 ? '+' : ''
  return formatLtr(`${sign}${number}${suffix}`)
}
