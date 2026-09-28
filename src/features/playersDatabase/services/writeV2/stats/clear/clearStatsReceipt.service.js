// src/features/playersDatabase/services/writeV2/stats/clear/clearStatsReceipt.service.js

import {
  doc,
  collection,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { normalizeSeasonLookupKey } from '../../../../model/shared/season.model.js'
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
  const snapshot = await trackedGetDocsFromServer(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActionsV2),
    where('flowType', '==', 'stats')
  ), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.writeActionsV2,
    action: 'clear-stats-receipt',
    operationSubtype: 'getFromServer',
  })
  const season = normalizeSeasonLookupKey(identity.seasonKey)
  const matchingClearReceipts = snapshot.docs.filter(row => {
    const receipt = row.data()
    const sameTarget = receipt.auditTarget?.birthTeamDocumentId === identity.birthTeamDocumentId &&
      season && normalizeSeasonLookupKey(receipt.auditTarget?.seasonKey) === season
    const isClear = receipt.operationType === 'clear' ||
      (!receipt.operationType && receipt.label === 'CLEAR_STATS')
    return receipt.status === 'open' && sameTarget && isClear
  })

  if (matchingClearReceipts.length > 1) {
    const error = new Error('Multiple open Stats receipts require review')
    error.code = 'CLEAR_STATS_MULTIPLE_OPEN_RECEIPTS'
    throw error
  }

  const initialFields = {
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
  }

  if (matchingClearReceipts.length === 1) {
    const receiptId = matchingClearReceipts[0].id
    // Keep canonicalStatus: pending/unknown never proves that nothing was written.
    await patchClearStatsReceiptV2({
      receiptId,
      patch: { ...initialFields, operationType: 'clear', lastAuditAt: null, lastAuditSummary: null },
    })
    return receiptId
  }

  // One setDoc includes the complete receipt; no follow-up metadata write.
  return createWriteActionReceiptV2({
    flowType: WRITE_ACTION_V2_FLOW_TYPE.STATS,
    operationType: 'clear',
    label: 'CLEAR_STATS',
    auditTarget: {
      birthTeamDocumentId: identity.birthTeamDocumentId,
      seasonKey: identity.seasonKey,
    },
    initialFields,
  })
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
