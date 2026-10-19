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

  const playerUrlPatch = {}
  Object.entries(approvedState.playerUrlsById || {}).forEach(([playerId, playerUrl]) => {
    if (!document.roster?.playersById?.[playerId] || !/^player__[0-9]{4}__[0-9]+$/.test(playerId)) {
      throw new Error('Invalid player identity for approved URL')
    }
    playerUrlPatch[`manual.playersById.${playerId}.playerUrl`] = playerUrl
    playerUrlPatch[`manual.playersById.${playerId}.updatedAt`] = approvedState.updatedAt || null
  })
  await updateDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
    {
      ...playerUrlPatch,
      stats: document.stats,
      scouting: document.scouting,
      'timestamps.updatedAt': approvedState.updatedAt || null,
    }
  )

  return { teamSeasonDocumentId, written: true }
}
