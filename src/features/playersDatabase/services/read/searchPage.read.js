// features/playersDatabase/services/read/searchPage.read.js

import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { toNumberOrZero } from '../../model/value.model.js'

const DEFAULT_SEARCH_RESULTS_LIMIT = 250

export async function readSearchPageData({
  maxRows = DEFAULT_SEARCH_RESULTS_LIMIT,
} = {}) {
  const safeLimit = Math.max(1, toNumberOrZero(maxRows) || DEFAULT_SEARCH_RESULTS_LIMIT)
  const snapshot = await getDocs(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', 'playerSeason'),
    limit(safeLimit)
  ))

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}
