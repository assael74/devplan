// src/features/playersDatabase/services/auditV2/stats/clear/auditClearStatsReceiptV2.js

import { buildClearStatsApprovedStateV2 } from '../../../../domain/statsV2/index.js'
import { prepareClearStatsForUiV2 } from '../../../../services/writeV2/stats/clear/prepareClearStatsForUi.flow.js'
import { readStatsCanonicalV2 } from '../readCanonical.js'
import { auditClearStatsV2 } from './auditClearStatsV2.js'
import { readClearStatsActualV2 } from './readClearStatsActual.js'

export async function auditClearStatsReceiptV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const canonical = await readStatsCanonicalV2({
    birthTeamDocumentId,
    seasonKey,
  })
  const proposedPlan = await prepareClearStatsForUiV2({
    birthTeamDocumentId,
    seasonKey,
    leagueId: canonical.leagueId,
  })
  const approvedState = buildClearStatsApprovedStateV2({
    proposedPlan,
    approvedAt: new Date().toISOString(),
  })
  const actualState = await readClearStatsActualV2({ approvedState })
  const audit = auditClearStatsV2({ approvedState, actualState })
  const findings = (Array.isArray(audit.checks) ? audit.checks : [])
    .filter(item => item?.status === 'failed')
    .map(item => ({
      type: 'clear_stats_mismatch',
      target: item.targetType,
      documentId: item.docId,
      reason: item.reason,
      check: item.check,
    }))
  const coveredTargets = [...new Set(
    (Array.isArray(audit.checks) ? audit.checks : [])
      .map(item => String(item?.targetType || '').trim())
      .filter(Boolean)
  )]

  return {
    flowType: 'stats',
    operationType: 'clear',
    birthTeamDocumentId,
    leagueId: canonical.leagueId,
    seasonKey,
    result: findings.length ? 'findings' : 'clean',
    coverage: {
      complete: true,
      coveredTargets,
      uncoveredTargets: [],
    },
    findings,
    summary: {
      checksCount: audit.checksCount,
      findingsCount: findings.length,
    },
  }
}
