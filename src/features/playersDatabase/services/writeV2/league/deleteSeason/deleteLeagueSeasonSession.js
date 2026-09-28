// src/features/playersDatabase/services/writeV2/league/deleteSeason/deleteLeagueSeasonSession.js

import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { assertApprovedDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js'
import { sameValue } from '../../../../domain/leagueV2/clear/leagueTeamsClearedState.builder.js'
import { failDeleteSeason } from '../../../../domain/leagueV2/deleteSeason/deleteLeagueSeason.builder.js'
import { readClearLeagueSources, readClearLeagueDocument, CLEAR_LEAGUE_COLLECTIONS } from '../clear/readClearLeagueTeams.js'
import { invalidateLeagueImportCacheV2 } from '../invalidateLeagueImportCache.js'
import { patchWriteActionReceiptV2 } from '../../receipt/repository.js'
import { persistWriteActionAuditResultV2 } from '../../receipt/service.js'
import { openDeleteSeasonReceipt } from './deleteLeagueSeasonReceipt.js'
import { auditLeagueV2 } from '../../../auditV2/league/index.js'

const withoutTime = value => value && Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'updatedAt'))
const equal = (left, right) => sameValue(withoutTime(left), withoutTime(right))
const invalidate = state => invalidateLeagueImportCacheV2(state.identity)

export const startDeleteSeasonSession = async approvedState => {
  assertApprovedDeleteSeason(approvedState)
  const sources = await readClearLeagueSources()
  if (!sameValue(sources, approvedState.sources)) failDeleteSeason('DELETE_SEASON_CHANGED', 'Prepare again')
  return openDeleteSeasonReceipt(approvedState.identity)
}

export const writeDeleteSeasonStep = async ({ approvedState, step, receiptId }) => {
  assertApprovedDeleteSeason(approvedState)
  if (!['league', 'leaguesMaster'].includes(step)) throw new Error('Invalid step')
  const operation = approvedState.operations.find(row => row.kind === step)
  let count = { written: 0, skipped: 1, failed: 0 }
  try {
    if (operation) {
      try {
        const actual = await readClearLeagueDocument(step, operation.docId)
        const expected = { ...(operation.before || { id: 'all', docType: 'leagues_master' }), ...operation.patch }
        if (!equal(actual, expected)) {
          if (!equal(actual, operation.before)) failDeleteSeason('DELETE_SEASON_CHANGED', 'Document changed')
          const reference = doc(db, CLEAR_LEAGUE_COLLECTIONS[step], operation.docId)
          if (operation.before === null && step === 'leaguesMaster') {
            await setDoc(reference, { id: 'all', docType: 'leagues_master', ...operation.patch, updatedAt: serverTimestamp() })
          } else {
            await updateDoc(reference, { ...operation.patch, updatedAt: step === 'league' ? operation.patch.updatedAt : serverTimestamp() })
          }
          count = { written: 1, skipped: 0, failed: 0 }
        }
      } catch (error) {
        error.failedTarget = { targetType: step, documentId: operation.docId }
        throw error
      }
    }
    try {
      await patchWriteActionReceiptV2({ receiptId, patch: {
        lastCompletedStep: step, executionStatus: 'running', failedStep: null, failedTarget: null,
        ...(step === 'league' ? { canonicalStatus: 'reported' } : {}),
      } })
    } catch (error) {
      error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
      throw error
    }
    return count
  } finally {
    invalidate(approvedState)
  }
}

export const failDeleteSeasonSession = async ({ approvedState, receiptId, step, error }) => {
  assertApprovedDeleteSeason(approvedState)
  invalidate(approvedState)
  await patchWriteActionReceiptV2({ receiptId, patch: {
    status: 'open', executionStatus: 'failed', failedStep: step, failedTarget: error.failedTarget || null,
    ...(step === 'league' ? { canonicalStatus: 'failed_or_unknown' } : {}),
  } })
}

export const finishDeleteSeasonSession = async ({ approvedState, receiptId }) => {
  assertApprovedDeleteSeason(approvedState)
  const audit = await auditLeagueV2({ ...approvedState.identity, expectedLifecycle: 'season_absent' })
  // Historical preservation proof is possible only in this live session.
  for (const operation of approvedState.operations.filter(row => row.kind === 'league')) {
    const actual = await readClearLeagueDocument('league', operation.docId)
    if (!equal(actual, { ...operation.before, ...operation.patch })) {
      audit.findings.push({ type: 'source_mismatch', target: 'league', documentId: operation.docId, reason: 'נתונים שנדרשו להישמר השתנו.' })
    }
  }
  audit.summary.findingsCount = audit.findings.length
  audit.result = !audit.coverage.complete ? 'partial' : audit.findings.length ? 'findings' : 'clean'
  invalidate(approvedState)
  try {
    await persistWriteActionAuditResultV2({ receiptId, audit })
  } catch (error) {
    error.failedTarget = { targetType: 'writeAction', documentId: receiptId }
    throw error
  }
  return audit
}
