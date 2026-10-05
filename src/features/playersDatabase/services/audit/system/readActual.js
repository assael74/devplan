// src/features/playersDatabase/services/audit/system/readActual.js

import { collection } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const readCollection = async (collectionName, action) => {
  const snapshot = await trackedGetDocsFromServer(
    collection(db, collectionName),
    {
      feature: 'playersDatabase',
      collection: collectionName,
      action,
      operationSubtype: 'audit-getDocsFromServer',
    }
  )

  return snapshot.docs.map(row => ({
    id: row.id,
    data: row.data() || {},
  }))
}

export const readSystemAuditActual = async () => {
  const [
    teamRoots,
    teamSeasons,
    playerRoots,
    playerSeasons,
    playerSearchIndexes,
    leagues,
    clubProfiles,
  ] = await Promise.all([
    readCollection(PLAYERS_DATABASE_COLLECTIONS.teamRoots, 'audit-system-team-roots'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.teamSeasons, 'audit-system-team-seasons'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.playerRoots, 'audit-system-player-roots'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.playerSeasons, 'audit-system-player-seasons'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.playerSearchIndexes, 'audit-system-player-search-indexes'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.leagues, 'audit-system-leagues'),
    readCollection(PLAYERS_DATABASE_COLLECTIONS.clubProfiles, 'audit-system-club-profiles'),
  ])

  return {
    teamRoots,
    teamSeasons,
    playerRoots,
    playerSeasons,
    playerSearchIndexes,
    leagues,
    clubProfiles,
  }
}
