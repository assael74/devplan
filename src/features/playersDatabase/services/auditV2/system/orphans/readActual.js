// src/features/playersDatabase/services/auditV2/system/orphans/readActual.js

import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

const usage = (collectionName, action, operationSubtype) => ({
  feature: 'playersDatabase',
  collection: collectionName,
  action,
  operationSubtype,
})

const mapRows = snapshot => snapshot.docs.map(row => ({
  id: row.id,
  data: row.data() || {},
}))

const readSearchIndexesByType = async (entityType, action) => {
  const snapshot = await trackedGetDocsFromServer(
    query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', entityType)
    ),
    usage(
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action,
      'audit-getDocsFromServer'
    )
  )

  return mapRows(snapshot)
}

const readCollection = async (collectionName, action) => {
  const snapshot = await trackedGetDocsFromServer(
    collection(db, collectionName),
    usage(collectionName, action, 'audit-getDocsFromServer')
  )

  return mapRows(snapshot)
}

const readClubsMaster = async () => {
  const snapshot = await trackedGetDocFromServer(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsMaster, 'all'),
    usage(
      PLAYERS_DATABASE_COLLECTIONS.clubsMaster,
      'audit-v2-system-orphans-read-clubs-master',
      'audit-getDocFromServer'
    )
  )

  return snapshot.exists()
    ? { id: snapshot.id, ...(snapshot.data() || {}) }
    : null
}

export async function readOrphanAuditActualV2() {
  const [
    teamSearchIndexes,
    playerSearchIndexes,
    teamSeasons,
    clubs,
    clubsMaster,
  ] = await Promise.all([
    readSearchIndexesByType(
      'birthTeamSeason',
      'audit-v2-system-orphans-read-team-indexes'
    ),
    readSearchIndexesByType(
      'playerSeason',
      'audit-v2-system-orphans-read-player-indexes'
    ),
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
      'audit-v2-system-orphans-read-team-seasons'
    ),
    readCollection(
      PLAYERS_DATABASE_COLLECTIONS.clubs,
      'audit-v2-system-orphans-read-clubs'
    ),
    readClubsMaster(),
  ])

  return {
    teamSearchIndexes,
    playerSearchIndexes,
    teamSeasons,
    clubs,
    clubsMaster,
  }
}
