// features/playersDatabase/services/read/team.js

import { doc, getDoc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'

const clean = value => String(value ?? '').trim()

const teamDocRef = teamId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.teams, clean(teamId))

export async function getTeamById(teamId) {
  const safeTeamId = clean(teamId)
  if (!safeTeamId) return null

  const snapshot = await getDoc(teamDocRef(safeTeamId))
  if (!snapshot.exists()) return null

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}
