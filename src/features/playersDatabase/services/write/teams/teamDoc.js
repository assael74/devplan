// features/playersDatabase/services/write/teams/teamDoc.js

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { clean, toNumberOrZero } from '../leagues/leagueDoc.js'

const getBirthTeamId = team =>
  clean(team.birthTeamDocumentId || team.birthTeamId || team.teamDocumentId || team.teamId)

export const teamDocRef = teamId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.teams, clean(teamId))

export const buildTeamBaseDoc = (team = {}, currentData = {}) => {
  const birthTeamId = getBirthTeamId(team)
  const birthTeamSlot = toNumberOrZero(team.birthTeamSlot || team.teamSlot || currentData.birthTeamSlot) || 1

  return {
    id: birthTeamId,
    clubId: clean(team.clubId || currentData.clubId),
    birthTeamId,
    birthYear: toNumberOrZero(team.birthYear ?? currentData.birthYear),
    birthTeamSlot,
    displayName: clean(team.displayName || team.teamName || currentData.displayName),
    teamId: birthTeamId,
    current: Array.isArray(currentData.current) ? currentData.current : [],
    history: Array.isArray(currentData.history) ? currentData.history : [],
    createdAt: currentData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export async function ensureTeamDoc(team = {}) {
  const teamId = getBirthTeamId(team)
  if (!teamId) throw new Error('Missing birth team id')

  const ref = teamDocRef(teamId)

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const docData = buildTeamBaseDoc({ ...team, birthTeamDocumentId: teamId }, currentData)

    transaction.set(ref, docData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      created: !snapshot.exists(),
    }
  })
}
