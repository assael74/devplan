// src/features/playersDatabase/services/cache/cacheInvalidation.js

import {
  buildLeagueDocumentCacheKey,
  buildClubSeasonIdentityIndexCacheKey,
  buildClubDocumentCacheKey,
  buildClubsMasterCacheKey,
  buildLeaguesCollectionCacheKey,
  buildLeaguesMasterCacheKey,
  buildPlayerDocumentCacheKey,
  buildTeamDocumentCacheKey,
  buildTeamPageDataCacheKey,
  buildTeamSeasonsByRootCacheKey,
  buildTeamSeasonDocumentCacheKey,
  PLAYERS_DATABASE_CACHE_PREFIXES,
} from './cacheKeys.js'
import {
  deleteDocumentCacheValue,
  invalidateDocumentCacheByPrefix,
  invalidateDocumentCacheByPrefixKeepingSnapshot,
  invalidateDocumentCacheValueKeepingSnapshot,
} from './documentCache.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const invalidateTeamPageDataCache = ({ leagueId = '', teamId = '' } = {}) => {
  const safeLeagueId = clean(leagueId)
  const safeTeamId = clean(teamId)

  if (safeLeagueId && safeTeamId) {
    invalidateDocumentCacheValueKeepingSnapshot(buildTeamPageDataCacheKey({
      leagueId: safeLeagueId,
      teamId: safeTeamId,
    }))
    return
  }

  invalidateDocumentCacheByPrefixKeepingSnapshot(PLAYERS_DATABASE_CACHE_PREFIXES.teamPage)
}

export const invalidateLeagueDocumentCache = leagueId => {
  const safeLeagueId = clean(leagueId)
  if (safeLeagueId) {
    deleteDocumentCacheValue(buildLeagueDocumentCacheKey(safeLeagueId))
  }

  deleteDocumentCacheValue(buildLeaguesCollectionCacheKey())
  invalidateTeamPageDataCache()
}
export const invalidateTeamDocumentCache = teamId => {
  const safeTeamId = clean(teamId)
  if (safeTeamId) {
    deleteDocumentCacheValue(buildTeamDocumentCacheKey(safeTeamId))
  }

  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teams)
  invalidateDocumentCacheByPrefix(PLAYERS_DATABASE_CACHE_PREFIXES.teamSeason)
  if (safeTeamId) {
    deleteDocumentCacheValue(buildTeamSeasonsByRootCacheKey(safeTeamId))
  }
  invalidateTeamPageDataCache()
}

export const invalidateTeamSeasonDocumentCache = teamSeasonDocumentId => {
  const safeTeamSeasonDocumentId = clean(teamSeasonDocumentId)
  if (safeTeamSeasonDocumentId) {
    deleteDocumentCacheValue(buildTeamSeasonDocumentCacheKey(safeTeamSeasonDocumentId))
  }
  invalidateTeamPageDataCache()
}


export const invalidateTeamSeasonsByRootCache = birthTeamDocumentId => {
  const safeBirthTeamDocumentId = clean(birthTeamDocumentId)
  if (!safeBirthTeamDocumentId) return

  deleteDocumentCacheValue(buildTeamSeasonsByRootCacheKey(safeBirthTeamDocumentId))
  invalidateTeamPageDataCache()
}

export const invalidateClubDocumentCache = clubId => {
  const safeClubId = clean(clubId)
  if (!safeClubId) return

  deleteDocumentCacheValue(buildClubDocumentCacheKey(safeClubId))
}

export const invalidatePlayerDocumentCache = playerId => {
  const safePlayerId = clean(playerId)
  if (!safePlayerId) return

  deleteDocumentCacheValue(buildPlayerDocumentCacheKey(safePlayerId))
}

export const invalidateLeaguesMasterDocumentCache = () => {
  deleteDocumentCacheValue(buildLeaguesMasterCacheKey())
  invalidateTeamPageDataCache()
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
  invalidateTeamPageDataCache()
}
