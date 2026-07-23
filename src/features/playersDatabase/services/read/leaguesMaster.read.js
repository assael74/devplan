import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG } from '../../catalog/genericObjects.catalog.js'

const MASTER_DOC_ID = 'all'

const leaguesMasterDocRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesMaster, MASTER_DOC_ID)

export async function readLeaguesMasterDocument() {
  const snapshot = await getDoc(leaguesMasterDocRef())

  if (!snapshot.exists()) {
    return {
      id: MASTER_DOC_ID,
      ...PLAYERS_DATABASE_LEAGUES_MASTER_DOCUMENT_CATALOG,
    }
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}
