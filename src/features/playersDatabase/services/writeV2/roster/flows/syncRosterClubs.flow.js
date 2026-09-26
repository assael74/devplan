import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { cleanValue } from '../../../../model/shared/value.model.js'

export async function syncRosterClubsV2({
  approvedClubProjectionState = {},
} = {}) {
  const documents = Array.isArray(approvedClubProjectionState.documents)
    ? approvedClubProjectionState.documents
    : []
  const validDocuments = documents.filter(item => (
    cleanValue(item?.clubId) && item?.document
  ))

  if (!validDocuments.length) {
    return { updatedClubs: 0 }
  }

  const batch = writeBatch(db)

  validDocuments.forEach(item => {
    const clubId = cleanValue(item.clubId)
    batch.set(doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.clubs,
      clubId
    ), {
      ...item.document,
      clubId,
      projectionVersion: 1,
      updatedAt: serverTimestamp(),
    })
  })

  await batch.commit()

  return {
    updatedClubs: validDocuments.length,
  }
}
