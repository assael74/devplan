// src/features/playersDatabase/services/writeV2/roster/clear/writeClearRosterStep.js

import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { assertClearRosterApprovedState } from '../../../../domain/rosterV2/clear/clearRosterApprovedState.builder.js'
import { applyClearRosterChanges, sameClearRosterValue } from '../../../../domain/rosterV2/clear/clearRosterPlan.builder.js'
import { CLEAR_ROSTER_COLLECTIONS } from './readClearRoster.js'

export const writeClearRosterStep = async ({ approvedState, step, onProgress }) => {
  assertClearRosterApprovedState(approvedState)
  const result = { written: 0, skipped: 0, failed: 0 }
  const report = () => onProgress?.({ ...result })
  const operations = step === 'playerIndex'
    ? approvedState.deletions
    : approvedState.operations.filter(operation => operation.kind === step)
  if (step !== 'playerIndex' && operations.length !== 1) throw new Error('Unknown Clear Roster step')

  for (const operation of operations) {
    try {
      const reference = doc(db, CLEAR_ROSTER_COLLECTIONS[step], operation.docId)
      if (step === 'playerIndex') {
        await deleteDoc(reference)
      } else {
        const next = applyClearRosterChanges(operation.source, operation.changes)
        const fields = [...new Set(operation.changes.map(change => change.path[0]))]
        if (fields.every(field => sameClearRosterValue(next[field], operation.source[field]))) {
          result.skipped += 1
          report()
          continue
        }
        await updateDoc(reference, {
          ...Object.fromEntries(fields.map(field => [field, next[field]])),
          updatedAt: serverTimestamp(),
        })
      }
      result.written += 1
      report()
    } catch (error) {
      result.failed += 1
      report()
      error.failedTarget = operation.docId
      throw error
    }
  }
  return result
}
