// features/playersDatabase/components/summary/hooks/summaryCache.js

const CACHE_TTL_MS = 3 * 60 * 1000

let cache = {
  leagues: [],
  latestSnapshots: [],
  yearGroupOpportunities: [],
  loadedAt: 0,
  dirty: true,
}

export const getSummaryCache = () => {
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

export const setSummaryCache = ({
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

export const markSummaryCacheDirty = () => {
  cache = {
    ...cache,
    dirty: true,
  }
}
