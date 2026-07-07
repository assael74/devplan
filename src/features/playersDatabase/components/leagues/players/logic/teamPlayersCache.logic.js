// features/playersDatabase/components/leagues/players/logic/teamPlayersCache.logic.js

import {
  clean,
  createPdbCache,
  getTeamCacheKey,
} from '../../../../sharedLogic/index.js'

export const teamPlayersCache = createPdbCache({
  namespace: 'teamRows',
  session: true,
})

export const getTeamPlayersBaseCacheKey = team =>
  getTeamCacheKey(team)

export const getTeamPlayersCacheKey = ({
  team,
  activeSearch = false,
  effectiveViewMode = 'profiles',
  playerSearch,
} = {}) => {
  const baseCacheKey = getTeamPlayersBaseCacheKey(team)

  if (activeSearch) {
    return [
      baseCacheKey,
      'search',
      clean(playerSearch?.mode || 'eligible'),
      clean(playerSearch?.profileId),
    ].join('|')
  }

  if (effectiveViewMode === 'full') return `${baseCacheKey}|full`

  if (effectiveViewMode === 'profiles') {
    return [
      baseCacheKey,
      'profiles',
      clean(playerSearch?.mode || 'eligible'),
    ].join('|')
  }

  return baseCacheKey
}

export const readCachedTeamPlayersRows = cacheKey => {
  const cached = teamPlayersCache.get(cacheKey)

  if (Array.isArray(cached?.value?.rows)) return cached.value.rows
  if (Array.isArray(cached?.rows)) return cached.rows

  return null
}

export const writeCachedTeamPlayersRows = (cacheKey, rows) => {
  teamPlayersCache.set(cacheKey, {
    rows: Array.isArray(rows) ? rows : [],
  })
}

export const clearCachedTeamPlayersRows = prefix => {
  teamPlayersCache.clearByPrefix(prefix)
}

export const getCachedTeamPlayersRowsCount = team => {
  const cached = readCachedTeamPlayersRows(getTeamPlayersBaseCacheKey(team))
  const count = Array.isArray(cached) ? cached.length : 0

  return count > 0 ? count : null
}
