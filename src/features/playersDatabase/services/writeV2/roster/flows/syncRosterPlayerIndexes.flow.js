import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

const BATCH_LIMIT = 400

const chunksOf = (rows = [], size = BATCH_LIMIT) => {
  const chunks = []
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size))
  }
  return chunks
}

export async function syncRosterPlayerIndexesV2({
  approvedPlayerIndexState = {},
} = {}) {
  const upserts = Array.isArray(approvedPlayerIndexState.upserts)
    ? approvedPlayerIndexState.upserts
    : []
  const deletes = Array.isArray(approvedPlayerIndexState.deletes)
    ? approvedPlayerIndexState.deletes
    : []
  const operations = [
    ...upserts.map(row => ({ type: 'upsert', ...row })),
    ...deletes.map(docId => ({ type: 'delete', docId })),
  ].filter(row => row.docId)

  for (const chunk of chunksOf(operations)) {
    const batch = writeBatch(db)

    chunk.forEach(operation => {
      const ref = doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        operation.docId
      )

      if (operation.type === 'delete') {
        batch.delete(ref)
        return
      }

      batch.set(ref, {
        ...(operation.fields || {}),
        updatedAt: serverTimestamp(),
      }, { merge: true })
    })

    await batch.commit()
  }

  return {
    upsertedCount: upserts.length,
    deletedCount: deletes.length,
  }
}
