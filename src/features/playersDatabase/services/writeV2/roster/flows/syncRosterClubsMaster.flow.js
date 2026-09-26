import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { invalidateClubsMasterDocumentCache } from '../../../cache/index.js'

export async function syncRosterClubsMasterV2({
  approvedClubsMasterState = {},
} = {}) {
  const clubs = Array.isArray(approvedClubsMasterState.clubs)
    ? approvedClubsMasterState.clubs
    : null

  if (!clubs) {
    throw new Error('Missing approved Clubs Master state')
  }

  const id = approvedClubsMasterState.id || 'all'

  await setDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, id),
    {
      id,
      projectionVersion: approvedClubsMasterState.projectionVersion || 1,
      clubs,
      updatedAt: serverTimestamp(),
    }
  )

  invalidateClubsMasterDocumentCache()

  return {
    updated: true,
    clubsCount: clubs.length,
  }
}
