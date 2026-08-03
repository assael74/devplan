// features/playersDatabase/services/read/league.js

import { collection, doc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedGetDoc, trackedGetDocs } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  buildLeagueDocumentCacheKey,
  buildLeaguesCollectionCacheKey,
  readWithDocumentCache,
  setDocumentCacheValue,
} from '../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const leaguesRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues)

const leagueDocRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

const readLeagueDocumentFromFirestore = async leagueId => {
  const snapshot = await trackedGetDoc(leagueDocRef(leagueId), {
    feature: 'playersDatabase',
    action: 'league-read',
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
  })
  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export async function listLeagues() {
  return readWithDocumentCache({
    key: buildLeaguesCollectionCacheKey(),
    read: async () => {
      const snapshot = await trackedGetDocs(leaguesRef(), {
        feature: 'playersDatabase',
        action: 'leagues-list',
        collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      })
      const rows = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))

      rows.forEach(row => {
        setDocumentCacheValue({
          key: buildLeagueDocumentCacheKey(row.id),
          value: row,
        })
      })

      return rows
    },
  })
}

export async function hasLeagueById(leagueId) {
  return Boolean(await getLeagueById(leagueId))
}

export async function getLeagueById(leagueId) {
  const safeLeagueId = clean(leagueId)
  if (!safeLeagueId) return null

  return readWithDocumentCache({
    key: buildLeagueDocumentCacheKey(safeLeagueId),
    read: () => readLeagueDocumentFromFirestore(safeLeagueId),
  })
}

export async function listLeaguesByIds(leagueIds = []) {
  const rows = await listLeagues()
  const ids = new Set((Array.isArray(leagueIds) ? leagueIds : []).map(clean).filter(Boolean))
  return rows.filter(row => ids.has(clean(row.id)))
}
