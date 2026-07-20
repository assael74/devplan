// features/playersDatabase/services/read/league.js

import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const clean = value => String(value ?? '').trim()

const leaguesRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues)

const leagueDocRef = leagueId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

export async function listLeagues() {
  const snapshot = await getDocs(leaguesRef())

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function hasLeagueById(leagueId) {
  const safeLeagueId = clean(leagueId)
  if (!safeLeagueId) return false

  const snapshot = await getDoc(leagueDocRef(safeLeagueId))
  return snapshot.exists()
}

export async function getLeagueById(leagueId) {
  const safeLeagueId = clean(leagueId)
  if (!safeLeagueId) return null

  const snapshot = await getDoc(leagueDocRef(safeLeagueId))
  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export async function listLeaguesByIds(leagueIds = []) {
  const rows = await listLeagues()
  const ids = new Set((Array.isArray(leagueIds) ? leagueIds : []).map(clean).filter(Boolean))
  return rows.filter(row => ids.has(clean(row.id)))
}
