// src/features/playersDatabase/domain/contracts/domainValue.contract.js

export const cleanDomainValue = value => String(value === null || value === undefined ? '' : value).trim()

export const hasDomainValue = value => value !== null && value !== undefined && value !== ''

export const firstDomainValue = (...values) => values.find(hasDomainValue)

export const toDomainNumber = (value, fallback = null) => {
  if (!hasDomainValue(value)) return fallback
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

export const toDomainNumberOrZero = value => toDomainNumber(value, 0)

export const toNullablePositiveNumber = value => {
  const numberValue = toDomainNumber(value)
  return numberValue !== null && numberValue > 0 ? numberValue : null
}

export const toDomainArray = value => Array.isArray(value) ? value : []

export const uniqueDomainValues = values => {
  const seen = new Set()
  return toDomainArray(values)
    .map(cleanDomainValue)
    .filter(Boolean)
    .filter(value => {
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
}
