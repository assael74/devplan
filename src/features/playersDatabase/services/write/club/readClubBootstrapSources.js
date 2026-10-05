// src/features/playersDatabase/services/write/club/readClubBootstrapSources.js

import { collection, doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const usage = action => ({ feature: 'playersDatabase', action })

export const readClubBootstrapSources = async () => {
  const [profilesSnapshot, directorySnapshot] = await Promise.all([
    trackedGetDocsFromServer(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.clubProfiles),
      usage('club-bootstrap-read-profiles'),
    ),
    trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsDirectory, 'all'),
      usage('club-bootstrap-read-directory'),
    ),
  ])

  return {
    profiles: profilesSnapshot.docs.map(item => ({ id: item.id, ...item.data() })),
    directory: directorySnapshot.exists()
      ? { id: directorySnapshot.id, ...directorySnapshot.data() }
      : null,
  }
}
