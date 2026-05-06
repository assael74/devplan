// shared/games/insights/team/sections/difficulty/difficulty.sources.js

const normalizeDifficultyKey = (value) => {
  const key = String(value || '').trim().toLowerCase()

  if (
    key === 'easy' ||
    key === 'low' ||
    key === 'weak' ||
    key === 'קל' ||
    key === 'רמה קלה' ||
    key === 'easy_game'
  ) {
    return 'easy'
  }

  if (
    key === 'equal' ||
    key === 'medium' ||
    key === 'same' ||
    key === 'balanced' ||
    key === 'שווה' ||
    key === 'אותה רמה' ||
    key === 'רמה שווה' ||
    key === 'equal_game'
  ) {
    return 'equal'
  }

  if (
    key === 'hard' ||
    key === 'high' ||
    key === 'strong' ||
    key === 'קשה' ||
    key === 'רמה קשה' ||
    key === 'hard_game'
  ) {
    return 'hard'
  }

  return key
}

const getBucketFromArray = (rows, wantedKey) => {
  if (!Array.isArray(rows)) return null

  return (
    rows.find((row) => {
      const key = normalizeDifficultyKey(
        row && (row.id || row.key || row.type || row.label || row.title)
      )

      return key === wantedKey
    }) || null
  )
}

const getBucketFromObject = (source, wantedKey) => {
  if (!source || Array.isArray(source)) return null

  if (source[wantedKey]) return source[wantedKey]

  const keys = Object.keys(source)

  for (const key of keys) {
    const normalizedKey = normalizeDifficultyKey(key)

    if (normalizedKey === wantedKey) {
      return source[key]
    }
  }

  return null
}

export function resolveDifficultySource(insights) {
  if (!insights) return null

  if (insights.difficultyProjection?.current) {
    return insights.difficultyProjection.current
  }

  if (insights.difficultyProjection) {
    return insights.difficultyProjection
  }

  if (insights.difficulty?.current) {
    return insights.difficulty.current
  }

  if (insights.difficulty) {
    return insights.difficulty
  }

  if (insights.games?.difficultyProjection?.current) {
    return insights.games.difficultyProjection.current
  }

  if (insights.games?.difficultyProjection) {
    return insights.games.difficultyProjection
  }

  if (insights.games?.grouped?.byDifficulty) {
    return insights.games.grouped.byDifficulty
  }

  if (insights.active?.grouped?.byDifficulty) {
    return insights.active.grouped.byDifficulty
  }

  return null
}

export function getDifficultyBucket(source, wantedKey) {
  const fromObject = getBucketFromObject(source, wantedKey)
  if (fromObject) return fromObject

  const fromArray = getBucketFromArray(source, wantedKey)
  if (fromArray) return fromArray

  if (Array.isArray(source?.rows)) {
    return getBucketFromArray(source.rows, wantedKey)
  }

  if (Array.isArray(source?.items)) {
    return getBucketFromArray(source.items, wantedKey)
  }

  if (Array.isArray(source?.cards)) {
    return getBucketFromArray(source.cards, wantedKey)
  }

  return null
}
