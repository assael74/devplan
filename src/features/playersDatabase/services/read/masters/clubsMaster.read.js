// src/features/playersDatabase/services/read/masters/clubsMaster.read.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
  CLUBS_MASTER_DOCUMENT_ID,
} from '../../../catalog/firestoreDocuments/clubsMaster.catalog.js'
import {
  buildClubsMasterCacheKey,
  invalidateClubsMasterDocumentCache,
  readWithDocumentCache,
} from '../../cache/index.js'

const clubsMasterDocRef = () => doc(
  db,
  PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
  CLUBS_MASTER_DOCUMENT_ID
)

export async function readClubsMasterDocument({ fresh = false } = {}) {
  if (fresh) {
    invalidateClubsMasterDocumentCache()
  }

  return readWithDocumentCache({
    key: buildClubsMasterCacheKey(),
    read: async () => {
      const snapshot = await trackedGetDoc(clubsMasterDocRef(), {
        feature: 'playersDatabase',
        action: 'clubs-master-read',
        collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      })

      if (!snapshot.exists()) {
        return {
          id: CLUBS_MASTER_DOCUMENT_ID,
          ...CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
        }
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      }
    },
  })
}
