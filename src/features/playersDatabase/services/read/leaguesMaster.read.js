// features/playersDatabase/services/read/leaguesMaster.read.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG } from '../../catalog/genericObjects.catalog.js'
import {
  buildLeaguesMasterCacheKey,
  invalidateLeaguesMasterDocumentCache,
  readWithDocumentCache,
} from '../cache/index.js'

const MASTER_DOC_ID = 'all'

const leaguesMasterDocRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, MASTER_DOC_ID)

export async function readLeaguesMasterDocument({ fresh = false } = {}) {
  if (fresh) {
    invalidateLeaguesMasterDocumentCache()
  }

  return readWithDocumentCache({
    key: buildLeaguesMasterCacheKey(),
    read: async () => {
      const snapshot = await trackedGetDoc(leaguesMasterDocRef(), {
        feature: 'playersDatabase',
        action: 'leagues-master-read',
        collection: PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      })

      if (!snapshot.exists()) {
        return {
          id: MASTER_DOC_ID,
          ...PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG,
        }
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      }
    },
  })
}
