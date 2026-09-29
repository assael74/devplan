// src/features/playersDatabase/services/cache/cacheInvalidation.js

import {
  buildLeagueDocumentCacheKey,
  buildClubSeasonIdentityIndexCacheKey,
  buildClubsMasterCacheKey,
  buildLeaguesCollectionCacheKey,
  buildLeaguesMasterCacheKey,
  buildPlayerDocumentCacheKey,
  buildTeamDocumentCacheKey,
  buildTeamSeasonDocumentCacheKey,
  PLAYERS_DATABASE_CACHE_PREFIXES,
} from './cacheKeys.js'
import {
  deleteDocumentCacheValue,
  invalidateDocumentCacheByPrefix,
} from './documentCache.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const invalidateLeagueDocumentCache = leagueId => {
  const safeLeagueId = clean(leagueId)
  if (safeLeagueId) {
    deleteDocumentCacheValue(buildLeagueDocumentCacheKey(safeLeagueId))
  }

  deleteDocumentCacheValue(buildLeaguesCollectionCacheKey())
}
export const invalidateTeamDocumentCache = teamId => {
  const safeTeamId = clean(teamId)
  if (safeTeamId) {
    deleteDocumentCacheValue(buildTeamDocumentCacheKey(safeTeamId))
  }

  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teams)
  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teamSeason)
}

export const invalidateTeamSeasonDocumentCache = teamSeasonDocumentId => {
  const safeTeamSeasonDocumentId = clean(teamSeasonDocumentId)
  if (safeTeamSeasonDocumentId) {
    deleteDocumentCacheValue(buildTeamSeasonDocumentCacheKey(safeTeamSeasonDocumentId))
  }
}

export const invalidatePlayerDocumentCache = playerId => {
  const safePlayerId = clean(playerId)
  if (!safePlayerId) return

  deleteDocumentCacheValue(buildPlayerDocumentCacheKey(safePlayerId))
}

export const invalidateLeaguesMasterDocumentCache = () => {
  deleteDocumentCacheValue(buildLeaguesMasterCacheKey())
}

export const invalidateClubsMasterDocumentCache = () => {
  deleteDocumentCacheValue(buildClubsMasterCacheKey())
}

export const invalidateClubSeasonIdentityIndexCache = ({
  seasonKey,
  birthYear,
} = {}) => {
  if (!clean(seasonKey) || !Number(birthYear)) return

  deleteDocumentCacheValue(buildClubSeasonIdentityIndexCacheKey({
    seasonKey,
    birthYear,
  }))
}
