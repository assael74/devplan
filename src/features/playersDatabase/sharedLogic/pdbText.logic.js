// features/playersDatabase/sharedLogic/pdbText.logic.js

export const clean = value => String(value ?? '').trim()

export const hasText = value => clean(value).length > 0

export const normalizeText = value =>
  clean(value)
    .toLowerCase()
    .replace(/[״"]/g, '')
    .replace(/[׳']/g, '')
    .replace(/\s+/g, ' ')

export const normalizeLooseText = value =>
  normalizeText(value)
    .replace(/\s+/g, ' ')
    .trim()

export const sameClean = (a, b) => clean(a) && clean(a) === clean(b)

export const sameIfBoth = (a, b) =>
  !clean(a) || !clean(b) || clean(a) === clean(b)

export const toNumber = (value, fallback = 0) => {
  const numeric = Number(value)

  return Number.isFinite(numeric) ? numeric : fallback
}

export const firstText = (...values) => {
  for (const value of values) {
    const text = clean(value)
    if (text) return text
  }

  return ''
}

export const unique = values =>
  Array.from(new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)))

export const valueOrDash = value => {
  if (value === 0) return '0'

  return clean(value) || '-'
}
