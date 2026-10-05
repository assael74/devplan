// src/features/playersDatabase/services/write/roster/writeRosterParticipation.js

import { doc, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const writeRosterParticipation = async ({ patch = null } = {}) => {
  if (!patch) return { written: false, skipped: true }
  const teamSeasonDocumentId = clean(patch.teamSeasonDocumentId)
  if (!teamSeasonDocumentId || !patch.roster || !patch.movement) {
    throw new Error('Invalid Roster participation patch')
  }

  await updateDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
    {
      roster: patch.roster,
      movement: patch.movement,
      'timestamps.updatedAt': patch.updatedAt || null,
    }
  )

  return { written: true, skipped: false, teamSeasonDocumentId }
}

export default writeRosterParticipation
