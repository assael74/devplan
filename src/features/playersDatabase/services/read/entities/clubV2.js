import { doc } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export async function readClubDocumentV2({ clubId = '' } = {}) {
  const id = String(clubId || '').trim()
  if (!id) throw new Error('Missing club id')
  const snapshot = await trackedGetDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, id), {
    feature: 'playersDatabase', collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
    action: 'roster-v2-club-read', operationSubtype: 'projection-getDoc',
  })
  return { clubId: id, exists: snapshot.exists(), club: snapshot.exists() ? snapshot.data() || {} : null }
}
