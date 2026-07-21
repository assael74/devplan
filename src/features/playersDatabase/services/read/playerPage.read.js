// features/playersDatabase/services/read/playerPage.read.js

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { cleanValue } from '../../model/value.model.js'

const searchIndexesRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes)

const searchIndexDocRef = documentId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, cleanValue(documentId))

const findPlayerIndexByField = async ({ field, value }) => {
  const safeValue = cleanValue(value)
  if (!safeValue) return null

  const snapshot = await getDocs(query(
    searchIndexesRef(),
    where(field, '==', safeValue),
    limit(1)
  ))

  const row = snapshot.docs.find(item => (
    cleanValue(item.data()?.entityType) === 'playerSeason'
  ))

  return row
    ? { id: row.id, ...row.data() }
    : null
}

export async function readPlayerPageData({ playerId = '' } = {}) {
  const safePlayerId = cleanValue(playerId)
  if (!safePlayerId) return null

  const directSnapshot = await getDoc(searchIndexDocRef(safePlayerId))

  if (directSnapshot.exists()) {
    const data = directSnapshot.data() || {}

    if (cleanValue(data.entityType) === 'playerSeason') {
      return {
        id: directSnapshot.id,
        ...data,
      }
    }
  }

  const lookupFields = [
    'playerDocumentId',
    'playerId',
    'externalPlayerId',
  ]

  for (const field of lookupFields) {
    const row = await findPlayerIndexByField({
      field,
      value: safePlayerId,
    })

    if (row) return row
  }

  return null
}
