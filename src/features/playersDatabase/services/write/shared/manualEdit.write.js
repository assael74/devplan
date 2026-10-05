// src/features/playersDatabase/services/write/shared/manualEdit.write.js

import { collection, doc, query, where } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'

const usage = { feature: 'playersDatabase', action: 'manual-edit' }

export const manualEditRef = (collectionKey, documentId) => {
  const collectionName = collections[collectionKey]
  if (!collectionName || !String(documentId || '').trim()) {
    throw new Error('יעד העריכה חסר')
  }
  return doc(db, collectionName, String(documentId).trim())
}

export const requireManualEditDocument = snapshot => {
  if (!snapshot?.exists()) throw new Error('מסמך מחויב חסר; לא בוצעה שמירה')
  return snapshot.data()
}

export const readManualEditRefs = async (collectionKey, filters) => {
  const collectionName = collections[collectionKey]
  if (!collectionName) throw new Error('אוסף העריכה חסר')
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, collectionName),
      ...Object.entries(filters).map(([field, value]) => where(field, '==', value)),
    ),
    usage,
  )
  return snapshot.docs.map(item => item.ref)
}

export const readManualEditDocument = ref => trackedGetDocFromServer(ref, usage)

export const executeManualEdit = async ({ refs, build }) => {
  const updatedAt = new Date().toISOString()
  const uniqueRefs = [...new Map(refs.map(ref => [ref.path, ref])).values()]

  const changedCount = await trackedRunTransaction(db, async transaction => {
    const snapshots = new Map()
    for (const ref of uniqueRefs) {
      snapshots.set(ref.path, await transaction.get(ref))
    }

    const changes = build({
      get: ref => snapshots.get(ref.path),
      updatedAt,
    })

    changes.forEach(({ ref, patch }) => transaction.update(ref, { ...patch, updatedAt }))
    return changes.length
  }, usage)

  return { completed: true, changedCount }
}
