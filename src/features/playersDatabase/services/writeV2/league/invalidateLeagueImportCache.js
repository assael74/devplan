import {
  invalidateClubSeasonIdentityIndexCache,
  invalidateClubsMasterDocumentCache,
  invalidateLeagueDocumentCache,
  invalidateLeaguesMasterDocumentCache,
  invalidateTeamDocumentCache,
} from '../../cache/cacheInvalidation.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const invalidateLeagueImportCacheV2 = ({
  leagueId,
  seasonKey,
  birthYear,
  rows = [],
} = {}) => {
  invalidateLeagueDocumentCache(leagueId)
  invalidateLeaguesMasterDocumentCache()
  invalidateClubsMasterDocumentCache()
  invalidateClubSeasonIdentityIndexCache({ seasonKey, birthYear })

  const teamIds = new Set((Array.isArray(rows) ? rows : [])
    .map(row => clean(
      row?.birthTeamDocumentId || row?.teamDocumentId || row?.birthTeamId || row?.teamId
    ))
    .filter(Boolean))

  teamIds.forEach(invalidateTeamDocumentCache)
}
