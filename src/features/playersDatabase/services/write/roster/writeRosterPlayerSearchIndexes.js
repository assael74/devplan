// src/features/playersDatabase/services/write/roster/writeRosterPlayerSearchIndexes.js

import { deleteDoc, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeRosterPlayerSearchIndexes = async ({ approvedState = {} } = {}) => {
  const state = approvedState.playerSearchIndexes || {}
  const upserts = Array.isArray(state.upserts) ? state.upserts : []
  const deletes = Array.isArray(state.deletes) ? state.deletes : []

  upserts.forEach(row => {
    if (!row || !String(row.documentId || '').trim() || !row.document) {
      throw new Error('Invalid approved Player SearchIndex upsert')
    }
  })
  deletes.forEach(documentId => {
    if (!String(documentId || '').trim()) throw new Error('Invalid approved Player SearchIndex delete')
  })

  for (const row of upserts) {
    await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, row.documentId), row.document)
  }
  for (const documentId of deletes) {
    await deleteDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, documentId))
  }

  return { upsertedCount: upserts.length, deletedCount: deletes.length }
}

export default writeRosterPlayerSearchIndexes
