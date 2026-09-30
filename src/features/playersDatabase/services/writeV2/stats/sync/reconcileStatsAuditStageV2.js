import { readStatsCanonicalV2 } from '../../../auditV2/stats/readCanonical.js'
import { auditStatsV2 } from '../../../auditV2/stats/auditStatsV2.js'
import {
  buildStatsReconcileStageStateV2,
  STATS_RECONCILE_STAGE,
  STATS_RECONCILE_TARGETS_BY_STAGE,
  statsAuditHasTargetFindingV2,
} from '../../../auditV2/stats/reconcileState.js'
import {
  prepareStatsFinalSyncFromCanonicalV2,
} from '../prepare/prepareStatsImportPlanV2.js'
import {
  runStatsFinalSyncStageV2,
} from '../flows/statsFinalSync.flow.js'
import {
  persistWriteActionAuditResultV2,
} from '../../receipt/index.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const SUPPORTED_STAGES = Object.freeze(Object.values(STATS_RECONCILE_STAGE))

export async function reconcileStatsAuditStageV2({
  birthTeamDocumentId = '',
  seasonKey = '',
  stage = '',
  receiptId = '',
} = {}) {
  const requestedStage = clean(stage)

  if (!SUPPORTED_STAGES.includes(requestedStage)) {
    throw new Error(
      `Unsupported Stats Final Sync stage: ${requestedStage || 'missing'}`
    )
  }

  const before = await auditStatsV2({ birthTeamDocumentId, seasonKey })
  const stageStates = buildStatsReconcileStageStateV2(before)
  const stageState = stageStates.find(row => row.stage === requestedStage)

  if (stageState?.status === 'blocked') {
    return {
      skipped: true,
      blocked: true,
      reason: '',
      stage: requestedStage,
      blockedBy: stageState.blockedBy,
      audit: before,
      receiptStatus: await persistWriteActionAuditResultV2({
        receiptId,
        audit: before,
      }),
    }
  }

  if (stageState?.status !== 'needs_sync') {
    return {
      skipped: true,
      blocked: false,
      stage: requestedStage,
      audit: before,
      receiptStatus: await persistWriteActionAuditResultV2({
        receiptId,
        audit: before,
      }),
    }
  }

  const canonical = await readStatsCanonicalV2({
    birthTeamDocumentId,
    seasonKey,
  })
  const approvedState = await prepareStatsFinalSyncFromCanonicalV2({
    canonical,
    stage: requestedStage,
  })
  const write = await runStatsFinalSyncStageV2({
    stage: requestedStage,
    approvedState,
  })
  const audit = await auditStatsV2({ birthTeamDocumentId, seasonKey })
  const receiptStatus = await persistWriteActionAuditResultV2({
    receiptId,
    audit,
  })

  if (statsAuditHasTargetFindingV2(
    audit,
    STATS_RECONCILE_TARGETS_BY_STAGE[requestedStage]
  )) {
    const error = new Error(
      `תיקון ${requestedStage} הסתיים, אבל Audit מהשרת עדיין מצא פער ` +
      `(עודכנו ${Number(write?.updatedCount || 0)}, נוצרו ${Number(write?.createdCount || 0)}).`
    )
    error.code = 'STATS_RECONCILE_FINDINGS_REMAIN'
    error.stage = requestedStage
    error.write = write
    error.audit = audit
    error.receiptStatus = receiptStatus
    throw error
  }

  return {
    skipped: false,
    blocked: false,
    stage: requestedStage,
    write,
    audit,
    receiptStatus,
  }
}
