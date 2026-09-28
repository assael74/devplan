import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG } from '../../../catalog/firestoreDocuments/leaguesMaster.catalog.js'

const MASTER_DOC_ID = 'all'

export async function readActualStatsLeaguesMasterV2() {
  const snapshot = await trackedGetDocFromServer(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, MASTER_DOC_ID),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.leaguesMaster,
      action: 'audit-v2-stats-read-leagues-master',
      operationSubtype: 'audit-getDocFromServer',
    }
  )

  if (!snapshot.exists()) {
    return {
      id: MASTER_DOC_ID,
      documentExists: false,
      ...PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG,
    }
  }

  return { id: snapshot.id, documentExists: true, ...snapshot.data() }
}
