// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsReceipt.service.js

import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  WRITE_ACTION_V2_CANONICAL_STATUS,
  WRITE_ACTION_V2_FLOW_TYPE,
  closeWriteActionReceiptV2,
  createWriteActionReceiptV2,
  reportWriteActionCanonicalStatusV2,
  saveWriteActionAuditSummaryV2,
} from '../../receipt/index.js'

const receiptRef = receiptId => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.writeActionsV2,
  receiptId
)

export async function createClearStatsReceiptV2({ approvedState, startedAt }) {
  const identity = approvedState.identity || {}
  const receiptId = await createWriteActionReceiptV2({
    flowType: WRITE_ACTION_V2_FLOW_TYPE.STATS,
    label: 'CLEAR_STATS',
    auditTarget: {
      birthTeamDocumentId: identity.birthTeamDocumentId,
      seasonKey: identity.seasonKey,
    },
  })

  await updateDoc(receiptRef(receiptId), {
    operationType: 'clear',
    executionStatus: 'running',
    identity: {
      birthTeamDocumentId: identity.birthTeamDocumentId,
      seasonKey: identity.seasonKey,
      leagueId: identity.leagueId,
      clubId: identity.clubId || '',
    },
    approvedAt: approvedState.approvedAt,
    startedAt,
    completedAt: null,
    currentStatsState: approvedState.currentStatsState,
    canonicalWrite: {
      status: 'pending',
      writeSkipped: false,
      playersAffected: 0,
    },
    projectionWrite: {
      writesAttempted: 0,
      writesCompleted: 0,
      writesSkipped: 0,
      targets: [],
      failedTarget: null,
    },
    audit: {
      status: 'pending',
      failuresCount: 0,
    },
    failedStep: null,
    error: null,
    updatedAt: serverTimestamp(),
  })

  return receiptId
}

export const patchClearStatsReceiptV2 = async ({ receiptId, patch }) => {
  await updateDoc(receiptRef(receiptId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export const reportClearStatsCanonicalV2 = ({ receiptId, succeeded }) => (
  reportWriteActionCanonicalStatusV2({
    receiptId,
    canonicalStatus: succeeded
      ? WRITE_ACTION_V2_CANONICAL_STATUS.REPORTED
      : WRITE_ACTION_V2_CANONICAL_STATUS.FAILED_OR_UNKNOWN,
  })
)

export const saveClearStatsAuditSummaryV2 = ({ receiptId, audit, ranAt }) => (
  saveWriteActionAuditSummaryV2({
    receiptId,
    ranAt,
    coverage: 'complete',
    findingsCount: Number(audit?.failuresCount) || 0,
    checkedDomains: [...new Set(
      (Array.isArray(audit?.checks) ? audit.checks : [])
        .map(item => String(item?.targetType || '').trim())
        .filter(Boolean)
    )],
  })
)

export const closeClearStatsReceiptV2 = ({ receiptId }) => (
  closeWriteActionReceiptV2({ receiptId })
)
