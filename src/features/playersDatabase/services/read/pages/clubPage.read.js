import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildClubDocumentCacheKey,
  readWithDocumentCache,
  refreshWithDocumentCache,
} from '../../cache/index.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export async function readClubPageDocument({
  clubId = '',
  refresh = false,
} = {}) {
  const normalizedClubId = clean(clubId)
  if (!normalizedClubId) return null

  const key = buildClubDocumentCacheKey(normalizedClubId)
  const read = async () => {
    const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, normalizedClubId)
    const snapshot = await trackedGetDoc(reference, {
      feature: 'playersDatabase',
      action: 'club-page-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
    })

    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
  }

  return refresh
    ? refreshWithDocumentCache({ key, read })
    : readWithDocumentCache({ key, read })
}
