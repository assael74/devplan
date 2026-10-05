// src/features/playersDatabase/services/write/roster/writeRosterPlayerSeasons.js

import {
  FieldPath,
  deleteDoc,
  deleteField,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeRosterPlayerSeasons = async ({ approvedState = {} } = {}) => {
  const rows = Array.isArray(approvedState.playerSeasons) ? approvedState.playerSeasons : []
  let written = 0
  let deleted = 0
  for (const row of rows) {
    const documentId = String(row && row.documentId || '').trim()
    if (!documentId) throw new Error('Invalid approved Player Season write')
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.playerSeasons, documentId)
    if (row.operation === 'DELETE') {
      await deleteDoc(reference)
      deleted += 1
    } else if (row.operation === 'UPSERT_TEAM' && row.document) {
      if (!row.teamId) throw new Error('Missing Player Season teamId')
      if (!row.exists) {
        await setDoc(reference, row.document)
      } else {
        await setDoc(reference, {
          identity: row.document.identity,
          teamsById: {
            [row.teamId]: row.document.teamsById[row.teamId],
          },
          timestamps: {
            updatedAt: row.document.timestamps.updatedAt,
          },
        }, {
          mergeFields: [
            'identity',
            new FieldPath('teamsById', row.teamId),
            new FieldPath('timestamps', 'updatedAt'),
          ],
        })
      }
      written += 1
    } else if (row.operation === 'REMOVE_TEAM') {
      if (!row.teamId) throw new Error('Missing Player Season removal teamId')
      await updateDoc(
        reference,
        new FieldPath('teamsById', row.teamId),
        deleteField(),
        new FieldPath('timestamps', 'updatedAt'),
        row.updatedAt || null
      )
      written += 1
    } else {
      throw new Error('Invalid Player Season write operation')
    }
  }
  return { written, deleted }
}

export default writeRosterPlayerSeasons
