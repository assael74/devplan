import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
  CLUBS_MASTER_DOCUMENT_ID,
} from '../../../catalog/firestoreDocuments/clubsMaster.catalog.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export async function readActualStatsClubsV2({ expectedClubs = [] } = {}) {
  const clubIds = [...new Set(
    (Array.isArray(expectedClubs) ? expectedClubs : [])
      .map(row => clean(row?.clubId))
      .filter(Boolean)
  )]

  const clubs = await Promise.all(clubIds.map(async clubId => {
    const snapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clubId),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
        action: 'audit-v2-stats-read-club',
        operationSubtype: 'audit-getDocFromServer',
      }
    )

    return {
      clubId,
      exists: snapshot.exists(),
      club: snapshot.exists() ? snapshot.data() || {} : null,
    }
  }))

  const masterSnapshot = await trackedGetDocFromServer(
    doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      CLUBS_MASTER_DOCUMENT_ID
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      action: 'audit-v2-stats-read-clubs-master',
      operationSubtype: 'audit-getDocFromServer',
    }
  )

  const clubsMaster = masterSnapshot.exists()
    ? { id: masterSnapshot.id, exists: true, ...masterSnapshot.data() }
    : {
        id: CLUBS_MASTER_DOCUMENT_ID,
        exists: false,
        ...CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
      }

  return { clubs, clubsMaster }
}
