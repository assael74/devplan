import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { trackedGetDocs } from '../../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import {
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
  sortLeaguesMasterEntries,
} from '../../../../domain/projections/leaguesMaster.projection.js'
const MASTER_DOCUMENT_ID = 'all'

export async function syncLeaguesMasterV2() {
  const snapshot = await trackedGetDocs(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues),
    {
      feature: 'playersDatabase',
      action: 'league-v2-list-canonical-leagues',
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    }
  )
  const leagues = sortLeaguesMasterEntries(
    snapshot.docs.map(item => buildLeaguesMasterLeagueEntry({
      id: item.id,
      ...item.data(),
    }))
  )
  const summary = buildLeaguesMasterSummary(leagues)

  await setDoc(
    doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      MASTER_DOCUMENT_ID
    ),
    {
      id: MASTER_DOCUMENT_ID,
      docType: 'leagues_master',
      summary,
      leagues,
      updatedAt: serverTimestamp(),
    }
  )

  return {
    updated: true,
    leaguesCount: leagues.length,
    summary,
  }
}

