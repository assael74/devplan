// features/playersDatabase/services/write/teams/teamDoc.js

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  normalizeTeamIdentity,
  resolveBirthTeamDocumentId,
} from '../../../model/teamIdentity.model.js'
import {
  pickFirstValue,
  toNumberOrZero,
} from '../../../model/value.model.js'
import { clean } from '../leagues/leagueDoc.js'

const getBirthTeamId = team => resolveBirthTeamDocumentId(team)

export const teamDocRef = teamId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.teams, clean(teamId))

export const buildTeamBaseDoc = (team = {}, currentData = {}) => {
  const identity = normalizeTeamIdentity({ team, fallback: currentData })
  const birthTeamId = identity.birthTeamDocumentId

  return {
    id: birthTeamId,
    clubId: identity.clubId,
    birthTeamId,
    birthYear: toNumberOrZero(pickFirstValue(team.birthYear, currentData.birthYear)),
    birthTeamSlot: identity.birthTeamSlot,
    displayName: clean(pickFirstValue(
      team.displayName,
      team.teamName,
      currentData.displayName
    )),
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
    const docData = buildTeamBaseDoc({
      ...team,
      birthTeamDocumentId: teamId,
    }, currentData)

    transaction.set(ref, docData, { merge: true })

    return {
      birthTeamDocumentId: teamId,
      teamDocumentId: teamId,
      created: !snapshot.exists(),
    }
  })
}
