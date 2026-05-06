// shared/games/insights/team/sections/homeAway/homeAway.sources.js

const normalizeLocationKey = (value) => {
  const key = String(value || '').trim().toLowerCase()

  if (
    key === 'home' ||
    key === 'בית' ||
    key === 'homegame' ||
    key === 'home_game'
  ) {
    return 'home'
  }

  if (
    key === 'away' ||
    key === 'חוץ' ||
    key === 'awaygame' ||
    key === 'away_game'
  ) {
    return 'away'
  }

  return key
}

const getBucketFromArray = (rows, wantedKey) => {
  if (!Array.isArray(rows)) return null

  return (
    rows.find((row) => {
      const key = normalizeLocationKey(
        row && (row.id || row.key || row.type || row.label)
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
    const normalizedKey = normalizeLocationKey(key)

    if (normalizedKey === wantedKey) {
      return source[key]
    }
  }

  return null
}

export function resolveHomeAwaySource(insights) {
  if (!insights) return null

  if (insights.homeAwayProjection?.current) {
    return insights.homeAwayProjection.current
  }

  if (insights.homeAwayProjection) {
    return insights.homeAwayProjection
  }

  if (insights.homeAway?.current) {
    return insights.homeAway.current
  }

  if (insights.homeAway) {
    return insights.homeAway
  }

  if (insights.games?.homeAwayProjection?.current) {
    return insights.games.homeAwayProjection.current
  }

  if (insights.games?.homeAwayProjection) {
    return insights.games.homeAwayProjection
  }

  if (insights.games?.grouped?.byHomeOrAway) {
    return insights.games.grouped.byHomeOrAway
  }

  if (insights.active?.grouped?.byHomeOrAway) {
    return insights.active.grouped.byHomeOrAway
  }

  return null
}

export function getHomeAwayBucket(source, wantedKey) {
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

  return null
}
