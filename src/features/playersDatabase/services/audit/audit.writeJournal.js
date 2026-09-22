import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const writeActions = () => collection(db, PLAYERS_DATABASE_COLLECTIONS.writeActions)

export async function beginPlayersDatabaseWriteAction({
  actionType = '',
  auditScope = null,
} = {}) {
  if (!actionType) return null

  const reference = doc(writeActions())
  await setDoc(reference, {
    writeActionId: reference.id,
    actionType,
    auditScope,
    status: 'in_progress',
    recoveryRequired: false,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return reference.id
}

export async function updatePlayersDatabaseWriteAction({
  writeActionId = '',
  auditScope,
  status = '',
  failedStage = '',
  errorMessage = '',
  recoveryRequired,
  result = null,
  identity = null,
} = {}) {
  if (!writeActionId) return null

  const patch = {
    ...(auditScope !== undefined ? { auditScope } : {}),
    ...(status ? { status } : {}),
    ...(failedStage ? { failedStage } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    ...(typeof recoveryRequired === 'boolean' ? { recoveryRequired } : {}),
    ...(result ? { result } : {}),
    ...(identity ? { ...identity } : {}),
    updatedAt: serverTimestamp(),
  }

  if (status === 'in_progress') {
    patch.failedStage = ''
    patch.errorMessage = ''
    patch.recoveryRequired = false
  }
  if (status === 'completed') patch.completedAt = serverTimestamp()
  if (status === 'failed' || status === 'failed_after_canonical_commit') {
    patch.failedAt = serverTimestamp()
  }
  if (status === 'superseded') patch.supersededAt = serverTimestamp()

  await updateDoc(doc(writeActions(), writeActionId), patch)
  return writeActionId
}

export async function getPlayersDatabaseWriteAction({ writeActionId = '' } = {}) {
  if (!writeActionId) return null

  const snapshot = await getDoc(doc(writeActions(), writeActionId))
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null
}

// This is intentionally a small, UI-only read. The Audit modal uses it to
// offer recent actions without exposing technical ids in import modals.
export async function listRecentPlayersDatabaseWriteActions({ maxResults = 5 } = {}) {
  const resolvedLimit = Math.max(1, Math.min(Number(maxResults) || 5, 10))
  const snapshot = await getDocs(query(
    writeActions(),
    orderBy('updatedAt', 'desc'),
    limit(resolvedLimit)
  ))

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data(),
  }))
}

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
  const reference = await addDoc(writeActions(), {
    actionType,
    auditScope,
    status,
    failedStage,
    errorMessage,
    recoveryRequired: Boolean(recoveryRequired),
    ...(failed ? { failedAt: serverTimestamp() } : { completedAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
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
    doc(writeActions(), id),
    {
      recoveryRequired: false,
      recoveredAt: serverTimestamp(),
      recoveryAction,
    }
  )))
  return ids
}
