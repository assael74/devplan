import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

export async function recordPlayersDatabaseWriteAction({
  actionType = '',
  auditScope = null,
  status = 'completed',
  failedStage = '',
  errorMessage = '',
  recoveryRequired = false,
} = {}) {
  if (!actionType) return null
  const failed = status === 'failed_after_canonical_commit'
  const reference = await addDoc(collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActions), {
    actionType,
    auditScope,
    status,
    failedStage,
    errorMessage,
    recoveryRequired: Boolean(recoveryRequired),
    ...(failed ? { failedAt: serverTimestamp() } : { completedAt: serverTimestamp() }),
  })
  return reference.id
}

// A recovery marker is deliberately written only after the canonical repair
// succeeds. Until then the journal remains an active Audit finding.
export async function resolvePlayersDatabaseWriteActionFailures({
  writeActionIds = [],
  recoveryAction = '',
} = {}) {
  const ids = [...new Set((Array.isArray(writeActionIds) ? writeActionIds : [])
    .map(value => String(value || '').trim())
    .filter(Boolean))]
  await Promise.all(ids.map(id => updateDoc(
    doc(collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActions), id),
    {
      recoveryRequired: false,
      recoveredAt: serverTimestamp(),
      recoveryAction,
    }
  )))
  return ids
}
