import {
  invalidateClubsMasterDocumentCache,
  invalidateLeagueDocumentCache,
  invalidateLeaguesMasterDocumentCache,
  invalidateTeamDocumentCache,
} from '../../cache/cacheInvalidation.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const invalidateRosterImportCacheV2 = ({ plan } = {}) => {
  if (!plan) return

  invalidateLeagueDocumentCache(plan.leagueId)
  invalidateLeaguesMasterDocumentCache()
  invalidateClubsMasterDocumentCache()

  const teamIds = new Set([
    plan.birthTeamDocumentId,
    ...(Array.isArray(plan.approvedCounterpartStates)
      ? plan.approvedCounterpartStates.map(state => state?.birthTeamDocumentId)
      : []),
  ].map(clean).filter(Boolean))

  teamIds.forEach(invalidateTeamDocumentCache)
}
