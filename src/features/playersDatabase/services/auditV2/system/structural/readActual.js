// src/features/playersDatabase/services/auditV2/system/structural/readActual.js

import { collection } from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

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

export async function readStructuralAuditActualV2() {
  const [leagues, teamRoots, teamSeasons, clubs] = await Promise.all([
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.leagues,
      'audit-v2-system-structural-read-leagues'
    ),
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.teams,
      'audit-v2-system-structural-read-team-roots'
    ),
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      'audit-v2-system-structural-read-team-seasons'
    ),
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.clubs,
      'audit-v2-system-structural-read-clubs'
    ),
  ])

  return { leagues, teamRoots, teamSeasons, clubs }
}
