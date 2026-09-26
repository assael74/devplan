import {
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc, trackedGetDocs } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const readDoc = async (collectionName, id, action) => {
  const snapshot = await trackedGetDoc(doc(db, collectionName, id), {
    feature: 'playersDatabase',
    collection: collectionName,
    action,
    operationSubtype: 'audit-getDoc',
  })
  return snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() || {}) } : null
}

export async function readActualRosterAuditV2({
  expected = {},
  canonical = {},
} = {}) {
  const playerSnapshot = await trackedGetDocs(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('birthTeamId', '==', canonical.birthTeamDocumentId),
    where('seasonKey', '==', canonical.seasonKey),
    where('entityType', '==', 'playerSeason')
  ), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    action: 'audit-v2-roster-list-player-indexes',
    operationSubtype: 'audit-getDocs',
  })

  const [teamSearchIndex, league] = await Promise.all([
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      expected.teamSearchIndex?.id,
      'audit-v2-roster-read-team-index'
    ),
    readDoc(
      PLAYERS_DATABASE_COLLECTIONS.leagues,
      canonical.leagueId,
      'audit-v2-roster-read-league-projection'
    ),
  ])

  return {
    playerSearchIndexes: playerSnapshot.docs.map(row => ({
      id: row.id,
      ...(row.data() || {}),
    })),
    teamSearchIndex,
    league,
  }
}
