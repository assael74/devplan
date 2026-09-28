// src/features/playersDatabase/services/writeV2/league/clear/clearLeagueTeamsSession.js

import { createWriteActionReceiptV2, persistWriteActionAuditResultV2 } from '../../receipt/index.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'
import { assertClearLeagueApprovedState } from '../../../../domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js'
import { sameValue, failClearLeague } from '../../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'
import { readClearLeagueSources, readClearLeagueDocument, findClearLeagueReceipt } from './readClearLeagueTeams.js'
import { auditLeagueV2 } from '../../../auditV2/league/index.js'
import { invalidateLeagueImportCacheV2 } from '../invalidateLeagueImportCache.js'

export const startClearLeagueTeamsSession = async approvedState => {
  assertClearLeagueApprovedState(approvedState)
  const existing = await findClearLeagueReceipt(approvedState.identity)
  const fresh = await readClearLeagueSources()
  if (!sameValue(fresh, approvedState.sources)) failClearLeague('CLEAR_LEAGUE_CHANGED', 'Prepare sources changed')
  const initialFields = {
    executionStatus: 'running', lastCompletedStep: null, failedStep: null, failedTarget: null,
  }
  if (existing) {
    await patchWriteActionReceiptV2({
      receiptId: existing,
      patch: { ...initialFields, lastAuditAt: null, lastAuditSummary: null },
    })
    return existing
  }
  return createWriteActionReceiptV2({
    flowType: 'league', operationType: 'clear', label: 'CLEAR_LEAGUE_TEAMS',
    auditTarget: approvedState.identity, initialFields,
  })
}

export const reportClearLeagueStep = (receiptId, step) => patchWriteActionReceiptV2({
  receiptId,
  patch: {
    executionStatus: 'running', lastCompletedStep: step, failedStep: null, failedTarget: null,
    ...(step === 'league' ? { canonicalStatus: 'reported' } : {}),
  },
})

export const reportClearLeagueFailure = (receiptId, step, error) => patchWriteActionReceiptV2({
  receiptId,
  patch: {
    status: 'open', executionStatus: 'failed', failedStep: step, failedTarget: error.failedTarget || null,
    ...(step === 'league' ? { canonicalStatus: 'failed_or_unknown' } : {}),
  },
})

const withoutTime = value => value && Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'updatedAt'))

export const finishClearLeagueTeamsSession = async ({ approvedState, receiptId }) => {
  assertClearLeagueApprovedState(approvedState)
  const audit = await auditLeagueV2(approvedState.identity)
  // Additional before/after preservation proof for this session only.
  // The independent Audit above rebuilds expectations from current server sources.
  for (const operation of approvedState.operations) {
    const actual = await readClearLeagueDocument(operation.kind, operation.docId)
    const expected = operation.kind === 'team' || operation.patch === null
      ? null : { ...operation.before, ...operation.patch }
    if (!sameValue(withoutTime(actual), withoutTime(expected))) {
      audit.findings.push({ type: 'source_mismatch', target: operation.kind, documentId: operation.docId, reason: 'נמצא שינוי לא צפוי במסמך הפעולה.' })
    }
    if (operation.kind === 'team') {
      const root = await readClearLeagueDocument('root', operation.rootId)
      if (!sameValue(withoutTime(root), withoutTime({ ...operation.rootBefore, ...operation.rootPatch }))) {
        audit.findings.push({ type: 'source_mismatch', target: 'root', documentId: operation.rootId, reason: 'הפניות או נתוני הקבוצה אינם תואמים למצב המאושר.' })
      }
    }
  }
  audit.summary.findingsCount = audit.findings.length
  audit.result = !audit.coverage.complete ? 'partial' : audit.findings.length ? 'findings' : 'clean'
  invalidateLeagueImportCacheV2({
    ...approvedState.identity,
    rows: approvedState.operations.filter(item => item.kind === 'team').map(item => ({ birthTeamDocumentId: item.rootId })),
  })
  try {
    await persistWriteActionAuditResultV2({ receiptId, audit })
  } catch (error) {
    error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
    throw error
  }
  return audit
}
