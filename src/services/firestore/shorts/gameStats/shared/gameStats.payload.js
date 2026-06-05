// src/services/firestore/shorts/gameStats/shared/gameStats.payload.js

export function clean(value) {
  if (value === undefined || value === null) return ''

  return String(value).trim()
}

export function toNum(value) {
  const num = Number(value)

  if (!Number.isFinite(num)) return 0

  return num
}

export function clampMinZero(value) {
  return Math.max(0, toNum(value))
}

export function resolvePayload({ payload, draft }) {
  return payload || draft
}

export function getPayloadNumber({ payload, key, fallback = 0 }) {
  const meta = payload.meta || {}
  let value = fallback

  if (meta[key] !== undefined && meta[key] !== null) {
    value = meta[key]
  } else if (payload[key] !== undefined && payload[key] !== null) {
    value = payload[key]
  }

  const num = Number(value)

  if (!Number.isFinite(num)) return fallback

  return num
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function compactDoc(value) {
  if (Array.isArray(value)) {
    return value.map(item => compactDoc(item)).filter(item => item !== undefined)
  }

  if (!isPlainObject(value)) {
    if (value === null || value === undefined || value === '') return undefined

    return value
  }

  const next = Object.entries(value).reduce((acc, [key, item]) => {
    const cleanItem = compactDoc(item)

    if (cleanItem === undefined) return acc

    return {
      ...acc,
      [key]: cleanItem,
    }
  }, {})

  if (!Object.keys(next).length) return undefined

  return next
}

export function isEmptyAggregateValue(value) {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value) && !value.length) return true

  const num = Number(value)

  return Number.isFinite(num) && num === 0
}

export function compactAggregateByKeys({ item, keepKeys }) {
  return Object.entries(item || {}).reduce((acc, [key, value]) => {
    if (keepKeys.includes(key)) {
      return {
        ...acc,
        [key]: value,
      }
    }

    if (isEmptyAggregateValue(value)) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}
