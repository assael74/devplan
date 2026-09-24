// src/features/playersDatabase/services/write/players/playerDoc.upsert.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { playerDocRef } from './playerDoc.model.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const WRITABLE_ACTIONS = new Set(['create', 'update', 'delete'])

export const upsertProfiledPlayerDoc = async ({ approvedPlan = null } = {}) => {
  if (!approvedPlan || typeof approvedPlan !== 'object') {
    throw new Error('Missing approved player document plan')
  }

  const { action, patch, playerDocumentId } = approvedPlan

  if (!playerDocumentId) {
    throw new Error('Missing player document id in approved plan')
  }

  if (!WRITABLE_ACTIONS.has(action)) {
    return approvedPlan
  }

  if (action !== 'delete' && (!patch || typeof patch !== 'object')) {
    throw new Error('Missing player document patch in approved plan')
  }

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    if (action === 'delete') {
      transaction.delete(ref)
      return approvedPlan
    }

    transaction.set(ref, {
      ...patch,
      updatedAt: serverTimestamp(),
    }, { merge: true })
    return approvedPlan
  })
}
