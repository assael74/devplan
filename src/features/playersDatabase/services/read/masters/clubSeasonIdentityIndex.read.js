import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildClubSeasonIdentityIndexDocumentId,
  CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
} from '../../../catalog/firestoreDocuments/clubSeasonIdentityIndex.catalog.js'

export async function readClubSeasonIdentityIndex({ seasonKey = '', birthYear = 0 } = {}) {
  const id = buildClubSeasonIdentityIndexDocumentId({ seasonKey, birthYear })
  if (!id) return null

  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, id),
    {
      feature: 'playersDatabase',
      action: 'club-season-identity-index-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
    }
  )

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : {
        id,
        ...CLUB_SEASON_IDENTITY_INDEX_DOCUMENT_CATALOG,
        seasonKey: String(seasonKey || '').trim(),
        birthYear: Number(birthYear) || 0,
        entries: [],
      }
}
