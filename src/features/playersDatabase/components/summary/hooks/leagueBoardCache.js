// features/playersDatabase/components/summary/hooks/leagueBoardCache.js

const CACHE_TTL_MS = 3 * 60 * 1000

let cache = {
  leagues: [],
  latestSnapshots: [],
  yearGroupOpportunities: [],
  loadedAt: 0,
  dirty: true,
}

export const getLeagueBoardCache = () => {
  const hasData = cache.leagues.length > 0
  const fresh = Date.now() - cache.loadedAt < CACHE_TTL_MS

  if (!hasData || cache.dirty || !fresh) return null

  return {
    leagues: cache.leagues,
    latestSnapshots: cache.latestSnapshots,
    yearGroupOpportunities: cache.yearGroupOpportunities,
    loadedAt: cache.loadedAt,
  }
}

export const setLeagueBoardCache = ({
  leagues = [],
  latestSnapshots = [],
  yearGroupOpportunities = [],
}) => {
  cache = {
    leagues,
    latestSnapshots,
    yearGroupOpportunities,
    loadedAt: Date.now(),
    dirty: false,
  }
}

export const markLeagueBoardCacheDirty = () => {
  cache = {
    ...cache,
    dirty: true,
  }
}
