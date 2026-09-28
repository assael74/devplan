import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export async function readActualStatsPlayerDocumentsV2({
  expectedPlayerDocuments = [],
} = {}) {
  const rows = []

  for (const expected of Array.isArray(expectedPlayerDocuments)
    ? expectedPlayerDocuments
    : []) {
    const snapshot = await trackedGetDocFromServer(
      doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.players,
        expected.playerDocumentId
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'audit-v2-stats-read-player-document',
        operationSubtype: 'audit-getDoc',
      }
    )

    rows.push({
      playerDocumentId: expected.playerDocumentId,
      exists: snapshot.exists(),
      document: snapshot.exists()
        ? {
            id: snapshot.id,
            ...(snapshot.data() || {}),
          }
        : null,
    })
  }

  return rows
}
