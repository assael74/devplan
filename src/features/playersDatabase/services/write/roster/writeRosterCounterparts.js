// src/features/playersDatabase/services/write/roster/writeRosterCounterparts.js

import { doc, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeRosterCounterparts = async ({ approvedState = {} } = {}) => {
  const rows = Array.isArray(approvedState.counterparts) ? approvedState.counterparts : []
  for (const row of rows) {
    const documentId = String(row && row.documentId || '').trim()
    if (!documentId || !row.movement) throw new Error('Invalid approved counterpart write')
    await updateDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, documentId), {
      movement: row.movement,
    })
  }
  return { updatedCount: rows.length }
}

export default writeRosterCounterparts
