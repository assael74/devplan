// src/features/playersDatabase/domain/narrative/narrativeHash.js

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

export const serializeNarrativeMeaning = meaning => JSON.stringify(
  sortValue(meaning || {})
)

export const buildNarrativeHash = meaning => {
  const value = serializeNarrativeMeaning(meaning)
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `n1_${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export const buildSeasonHash = seasonMeaning => buildNarrativeHash({
  scope: 'season',
  season: seasonMeaning || null,
})

export const buildCareerHash = careerMeaning => buildNarrativeHash({
  scope: 'career',
  career: careerMeaning || null,
})
