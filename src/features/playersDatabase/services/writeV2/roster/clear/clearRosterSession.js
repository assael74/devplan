// src/features/playersDatabase/services/writeV2/roster/clear/clearRosterSession.js

import { createWriteActionReceiptV2, reportWriteActionCanonicalStatusV2, persistWriteActionAuditResultV2 } from '../../receipt/index.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'
import { assertClearRosterApprovedState } from '../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js'
import { auditRosterAbsentState } from '../../../auditV2/roster/auditRosterAbsentState.js'
import { invalidateRosterImportCacheV2 } from '../invalidateRosterImportCache.js'
import { readClearRosterDocument, readClearRosterEligibility } from './readClearRoster.js'
import { findOpenClearRosterReceipt } from './clearRosterPrerequisites.js'
import { sameClearRosterValue, applyClearRosterChanges } from '../../../../domain/rosterV2/clear/clearRosterPlan.builder.js'

export const CLEAR_ROSTER_STEPS = Object.freeze([
  { id: 'teamSeason', label: 'עונת הקבוצה' },
  { id: 'playerIndex', label: 'אינדקסי השחקנים' },
  { id: 'teamSearchIndex', label: 'אינדקס הקבוצה' },
  { id: 'league', label: 'הליגה' },
  { id: 'club', label: 'המועדון' },
  { id: 'clubsMaster', label: 'מרכז המועדונים' },
  { id: 'leaguesMaster', label: 'מרכז הליגות' },
])

export const startClearRosterSession = async approvedState => {
  assertClearRosterApprovedState(approvedState)
  if (!await readClearRosterEligibility(approvedState.identity)) {
    throw new Error('Clear Roster Stats prerequisite is not satisfied')
  }
  const existingReceiptId = await findOpenClearRosterReceipt(approvedState.identity)
  const initialFields = {
    executionStatus: 'running',
    lastCompletedStep: null,
    failedStep: null,
    failedTarget: null,
  }
  if (existingReceiptId) {
    await patchWriteActionReceiptV2({
      receiptId: existingReceiptId,
      patch: { ...initialFields, lastAuditAt: null, lastAuditSummary: null },
    })
    return existingReceiptId
  }
  return createWriteActionReceiptV2({
    flowType: 'roster', operationType: 'clear', label: 'מחיקת סגל', auditTarget: approvedState.identity,
    initialFields,
  })
}

export const reportClearRosterCanonical = async (receiptId, succeeded) => {
  try {
    await reportWriteActionCanonicalStatusV2({
      receiptId, canonicalStatus: succeeded ? 'reported' : 'failed_or_unknown',
    })
  } catch (error) {
    error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
    throw error
  }
}

export const reportClearRosterStep = async (receiptId, step) => {
  try {
    await patchWriteActionReceiptV2({
      receiptId,
      patch: { executionStatus: 'running', lastCompletedStep: step, failedStep: null, failedTarget: null },
    })
  } catch (error) {
    error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
    throw error
  }
}

export const reportClearRosterFailure = (receiptId, step, error) => {
  const failedTarget = typeof error.failedTarget === 'string'
    ? { targetType: step, documentId: error.failedTarget }
    : error.failedTarget || null
  return patchWriteActionReceiptV2({
    receiptId,
    patch: { status: 'open', executionStatus: 'failed', failedStep: step, failedTarget },
  })
}

export const finishClearRosterSession = async ({ receiptId, approvedState }) => {
  assertClearRosterApprovedState(approvedState)
  const audit = await auditRosterAbsentState(approvedState.identity)
  // An independent same-session preservation check supplements canonical Audit.
  // Projection expectations above are always rebuilt from server canonical data.
  const root = await readClearRosterDocument('teamRoot', approvedState.identity.birthTeamDocumentId)
  if (!sameClearRosterValue(root, approvedState.sources.teamRoot)) {
    audit.findings.push({ type: 'source_mismatch', target: 'teamRoot', documentId: approvedState.identity.birthTeamDocumentId, reason: 'זהות הקבוצה השתנתה.' })
  }
  for (const operation of approvedState.operations) {
    const actual = await readClearRosterDocument(operation.kind, operation.docId)
    const masks = operation.changes.map(change => ({ path: change.path, value: null }))
    const expectedPreserved = applyClearRosterChanges(operation.source, masks)
    const actualPreserved = actual ? applyClearRosterChanges(actual, masks) : null
    const omitTime = value => Object.fromEntries(Object.entries(value || {}).filter(([field]) => field !== 'updatedAt'))
    if (!actual || !sameClearRosterValue(omitTime(actualPreserved), omitTime(expectedPreserved))) {
      audit.findings.push({ type: 'source_mismatch', target: operation.kind, documentId: operation.docId, reason: 'נמצא שינוי לא צפוי במסמך משותף.' })
    }
  }
  audit.summary.findingsCount = audit.findings.length
  audit.result = !audit.coverage.complete ? 'partial' : audit.findings.length ? 'findings' : 'clean'
  try {
    await persistWriteActionAuditResultV2({ receiptId, audit })
  } catch (error) {
    error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
    throw error
  }
  invalidateRosterImportCacheV2({ plan: approvedState.identity })
  return audit
}
