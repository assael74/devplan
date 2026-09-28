import {
  invalidateClubsMasterDocumentCache,
  invalidateLeagueDocumentCache,
  invalidateLeaguesMasterDocumentCache,
  invalidatePlayerDocumentCache,
  invalidateTeamDocumentCache,
} from '../../cache/cacheInvalidation.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const invalidateStatsImportCacheV2 = ({ approvedState } = {}) => {
  if (!approvedState) return

  invalidateLeagueDocumentCache(approvedState.identity?.leagueId)
  invalidateLeaguesMasterDocumentCache()
  invalidateClubsMasterDocumentCache()

  const teamIds = new Set([
    approvedState.identity?.birthTeamDocumentId,
    ...(Array.isArray(approvedState.counterpartMovementPatches)
      ? approvedState.counterpartMovementPatches.map(patch => (
        patch?.birthTeamDocumentId || patch?.counterpartBirthTeamDocumentId
      ))
      : []),
  ].map(clean).filter(Boolean))

  teamIds.forEach(invalidateTeamDocumentCache)

  ;(Array.isArray(approvedState.playerDocumentPlans) ? approvedState.playerDocumentPlans : [])
    .map(plan => clean(plan?.playerDocumentId))
    .filter(Boolean)
    .forEach(invalidatePlayerDocumentCache)
}

