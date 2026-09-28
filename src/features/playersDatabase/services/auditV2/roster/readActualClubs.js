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

const readClub = async clubId => {
  const snapshot = await trackedGetDocFromServer(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clubId),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
      action: 'audit-v2-roster-read-club',
      operationSubtype: 'audit-getDocFromServer',
    }
  )

  return {
    clubId,
    exists: snapshot.exists(),
    club: snapshot.exists() ? snapshot.data() || {} : null,
  }
}

const readClubsMaster = async () => {
  const snapshot = await trackedGetDocFromServer(
    doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      CLUBS_MASTER_DOCUMENT_ID
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      action: 'audit-v2-roster-read-clubs-master',
      operationSubtype: 'audit-getDocFromServer',
    }
  )

  if (!snapshot.exists()) {
    return {
      id: CLUBS_MASTER_DOCUMENT_ID,
      exists: false,
      ...CLUBS_MASTER_DATABASE_GENERIC_OBJECTS_CATALOG,
    }
  }

  return {
    id: snapshot.id,
    exists: true,
    ...snapshot.data(),
  }
}

export async function readActualRosterClubsV2({ expectedClubs = [] } = {}) {
  const clubIds = [...new Set(
    (Array.isArray(expectedClubs) ? expectedClubs : [])
      .map(row => clean(row?.clubId))
      .filter(Boolean)
  )]
  const clubs = await Promise.all(clubIds.map(readClub))
  const clubsMaster = await readClubsMaster()

  return { clubs, clubsMaster }
}
