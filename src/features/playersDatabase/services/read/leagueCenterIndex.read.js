import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildLeagueCenterRows } from '../../model/leagueCenter.model.js'

const INDEX_DOC_ID = 'all'

const leagueCenterIndexRef = () =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagueCenterIndex, INDEX_DOC_ID)

export async function readLeagueCenterIndexData() {
  const snapshot = await getDoc(leagueCenterIndexRef())

  if (!snapshot.exists()) {
    return {
      id: INDEX_DOC_ID,
      rows: buildLeagueCenterRows({ leagueDocs: [] }),
    }
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}
