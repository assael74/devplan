// src/features/playersDatabase/domain/narrative/narrativeHash.js

import { NARRATIVE_MEANING_VERSION } from './narrative.contract.js'

const FINGERPRINT_PERCENT_STEP = 10

const sortValue = value => {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => ({
      ...result,
      [key]: sortValue(value[key]),
    }), {})
}

const roundFingerprintPercent = value => {
  const number = Number(value)
  if (!Number.isFinite(number)) return value

  return Math.round(number / FINGERPRINT_PERCENT_STEP) * FINGERPRINT_PERCENT_STEP
}

const normalizeFingerprintValue = (value, key = '') => {
  if (Array.isArray(value)) return value.map(item => normalizeFingerprintValue(item))
  if (!value || typeof value !== 'object') {
    if (
      key === 'strengthDepthPct' ||
      key === 'distancePct' ||
      key === 'distanceDeltaPct'
    ) {
      return roundFingerprintPercent(value)
    }

    return value
  }

  return Object.entries(value).reduce((result, [childKey, childValue]) => ({
    ...result,
    [childKey]: normalizeFingerprintValue(childValue, childKey),
  }), {})
}

export const serializeNarrativeMeaning = meaning => JSON.stringify(
  sortValue(normalizeFingerprintValue(meaning || {}))
)

export const buildNarrativeHash = meaning => {
  const value = serializeNarrativeMeaning(meaning)
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `n${NARRATIVE_MEANING_VERSION}_${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export const buildSeasonHash = seasonMeaning => buildNarrativeHash({
  scope: 'season',
  season: seasonMeaning || null,
})

export const buildCareerHash = careerMeaning => buildNarrativeHash({
  scope: 'career',
  career: careerMeaning || null,
})
