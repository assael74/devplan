// src/features/playersDatabase/services/write/stats/writeStatsCanonical.js

import { doc, updateDoc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamSeasonDocumentId } from '../../../domain/identity/index.js'

export const writeStatsCanonical = async ({ approvedState = {} } = {}) => {
  const document = approvedState.canonicalTeamSeason
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Missing approved Stats Team Season')
  }
  const teamSeasonDocumentId = buildTeamSeasonDocumentId({
    teamId: approvedState.teamId,
    seasonId: approvedState.seasonId,
  })
  if (teamSeasonDocumentId !== approvedState.teamSeasonDocumentId) {
    throw new Error('Stats Team Season target identity mismatch')
  }

  await updateDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
    {
      stats: document.stats,
      scouting: document.scouting,
      teamTaskSignals: document.teamTaskSignals,
      teamTaskAvailability: document.teamTaskAvailability,
      'timestamps.updatedAt': approvedState.updatedAt || null,
    }
  )

  return { teamSeasonDocumentId, written: true }
}
