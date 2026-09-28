import { readStatsCanonicalV2 } from './readCanonical.js'
import { auditStatsV2 } from './index.js'
import {
  prepareStatsFinalSyncFromCanonicalV2,
  runStatsFinalSyncStageV2,
  STATS_FINAL_SYNC_STAGE,
} from '../../writeV2/stats/index.js'
import {
  persistWriteActionAuditResultV2,
} from '../../writeV2/receipt/index.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const STATS_RECONCILE_STAGE = Object.freeze({
  COUNTERPARTS: STATS_FINAL_SYNC_STAGE.COUNTERPARTS,
  PLAYER_DOCUMENTS: STATS_FINAL_SYNC_STAGE.PLAYER_DOCUMENTS,
  PLAYER_INDEXES: STATS_FINAL_SYNC_STAGE.PLAYER_INDEXES,
  TEAM_LEAGUE: STATS_FINAL_SYNC_STAGE.TEAM_LEAGUE,
  CLUBS: STATS_FINAL_SYNC_STAGE.CLUBS,
})

const STATS_RECONCILE_STAGES = Object.freeze([
  STATS_RECONCILE_STAGE.COUNTERPARTS,
  STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS,
  STATS_RECONCILE_STAGE.PLAYER_INDEXES,
  STATS_RECONCILE_STAGE.TEAM_LEAGUE,
  STATS_RECONCILE_STAGE.CLUBS,
])

const TARGETS_BY_STAGE = Object.freeze({
  [STATS_RECONCILE_STAGE.COUNTERPARTS]: Object.freeze([
    'counterpart',
  ]),
  [STATS_RECONCILE_STAGE.PLAYER_DOCUMENTS]: Object.freeze([
    'playerDocument',
  ]),
  [STATS_RECONCILE_STAGE.PLAYER_INDEXES]: Object.freeze([
    'playerSearchIndex',
  ]),
  [STATS_RECONCILE_STAGE.TEAM_LEAGUE]: Object.freeze([
    'teamSearchIndex',
    'leagueMetadata',
    'leaguesMaster',
  ]),
  [STATS_RECONCILE_STAGE.CLUBS]: Object.freeze([
    'club',
    'clubsMaster',
  ]),
})

const hasTargetFinding = (audit, targets) => {
  const allowed = new Set(targets)
  return (audit?.findings || []).some(row => allowed.has(clean(row?.target)))
}

export function buildStatsReconcileStageStateV2(audit = {}) {
  const counterpartsNeedSync = hasTargetFinding(
    audit,
    TARGETS_BY_STAGE[STATS_RECONCILE_STAGE.COUNTERPARTS]
  )

  return STATS_RECONCILE_STAGES.map(stage => {
    const needsSync = hasTargetFinding(audit, TARGETS_BY_STAGE[stage])
    const blocked = (
      stage === STATS_RECONCILE_STAGE.CLUBS &&
      counterpartsNeedSync
    )
    return {
      stage,
      targets: TARGETS_BY_STAGE[stage],
      status: blocked
        ? 'blocked'
        : needsSync
          ? 'needs_sync'
          : 'clean',
      blockedBy: blocked
        ? STATS_RECONCILE_STAGE.COUNTERPARTS
        : '',
    }
  })
}

export async function reconcileStatsAuditStageV2({
  birthTeamDocumentId = '',
  seasonKey = '',
  stage = '',
  receiptId = '',
} = {}) {
  const requestedStage = clean(stage)

  if (!STATS_RECONCILE_STAGES.includes(requestedStage)) {
    throw new Error(
      `Unsupported Stats Final Sync stage: ${requestedStage || 'missing'}`
    )
  }

  const before = await auditStatsV2({
    birthTeamDocumentId,
    seasonKey,
  })
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
  const audit = await auditStatsV2({
    birthTeamDocumentId,
    seasonKey,
  })
  const receiptStatus = await persistWriteActionAuditResultV2({
    receiptId,
    audit,
  })

  if (hasTargetFinding(audit, TARGETS_BY_STAGE[requestedStage])) {
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

