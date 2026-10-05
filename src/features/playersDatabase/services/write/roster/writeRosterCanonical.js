// src/features/playersDatabase/services/write/roster/writeRosterCanonical.js

import { deleteDoc, doc, setDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const writeRosterCanonical = async ({ approvedState = {} } = {}) => {
  const canonical = approvedState.canonical || {}
  const teamId = String(approvedState.teamId || '').trim()
  const teamSeasonDocumentId = String(approvedState.teamSeasonDocumentId || '').trim()
  if (!teamId || !teamSeasonDocumentId) throw new Error('Missing approved Roster canonical identity')

  let teamRootWritten = false
  let teamRootDeleted = false
  let teamSeasonWritten = false
  let teamSeasonDeleted = false

  if (canonical.teamRootOperation === 'SET') {
    const identity = canonical.teamRoot && canonical.teamRoot.identity
    if (!identity || identity.teamId !== teamId) {
      throw new Error('Approved Team Root identity mismatch')
    }
    await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRoots, teamId), canonical.teamRoot)
    teamRootWritten = true
  } else if (canonical.teamRootOperation === 'DELETE') {
    await deleteDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRoots, teamId))
    teamRootDeleted = true
  } else if (canonical.teamRootOperation !== 'NONE') {
    throw new Error('Invalid Team Root write operation')
  }

  if (canonical.teamSeasonOperation === 'SET') {
    const identity = canonical.teamSeason && canonical.teamSeason.identity
    if (
      !identity ||
      identity.teamSeasonDocumentId !== teamSeasonDocumentId ||
      identity.teamId !== teamId ||
      identity.seasonId !== approvedState.seasonId
    ) {
      throw new Error('Approved Team Season identity mismatch')
    }
    await setDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId), canonical.teamSeason)
    teamSeasonWritten = true
  } else if (canonical.teamSeasonOperation === 'DELETE') {
    await deleteDoc(doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId))
    teamSeasonDeleted = true
  } else if (canonical.teamSeasonOperation !== 'NONE') {
    throw new Error('Invalid Team Season write operation')
  }

  return { teamRootWritten, teamRootDeleted, teamSeasonWritten, teamSeasonDeleted }
}

export default writeRosterCanonical
