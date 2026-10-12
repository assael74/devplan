// src/features/playersDatabase/services/audit/stats/index.js

import { buildStatsAuditExpected } from './buildExpected.js'
import { compareStatsAudit } from './compare.js'
import { readStatsAuditActual } from './readActual.js'

export const auditStats = async ({
  leagueId = '',
  teamId = '',
  seasonId = '',
  approvedState = null,
  scopedPlayerIds = [],
} = {}) => {
  const counterpartDocumentIds = Array.isArray(approvedState?.counterpartPatches)
    ? approvedState.counterpartPatches.map(patch => patch.documentId).filter(Boolean)
    : []
  const expectedPlayerIds = Array.from(new Set([
    ...(Array.isArray(approvedState?.playerRootPlans)
      ? approvedState.playerRootPlans.map(plan => plan.playerId)
      : []),
    ...(Array.isArray(approvedState?.playerSeasonPlans)
      ? approvedState.playerSeasonPlans.map(plan => plan.playerId)
      : []),
    ...(Array.isArray(approvedState?.playerSearchIndexPlans)
      ? approvedState.playerSearchIndexPlans.map(plan => plan.playerId)
      : []),
  ].filter(Boolean)))
  const actual = await readStatsAuditActual({
    leagueId,
    teamId,
    seasonId,
    counterpartDocumentIds,
    playerIds: expectedPlayerIds,
    scopedPlayerIds,
  })
  const expectedState = buildStatsAuditExpected({
    actual,
    approvedState,
    seasonId,
    scopedPlayerIds,
  })
  const findings = compareStatsAudit({ actual, expectedState, approvedState, seasonId })
  const complete = expectedState.complete === true

  return {
    status: complete && findings.length === 0 ? 'CLEAN' : complete ? 'FINDINGS' : 'PARTIAL',
    findings,
    coverage: {
      complete,
      coveredTargets: [
        'teamRoot',
        'teamSeason',
        'counterpartTeamSeasons',
        'playerRoots',
        'playerSeasons',
        'playerSearchIndexes',
        'leagueMetadata',
        'leaguesCenter',
        'clubsCenter',
      ],
      reason: complete ? '' : expectedState.reason,
    },
  }
}

export { buildStatsAuditExpected } from './buildExpected.js'
export { compareStatsAudit } from './compare.js'
export { readStatsAuditActual } from './readActual.js'
