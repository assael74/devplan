// src/features/playersDatabase/services/write/teams/teamSeasonDoc.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildTeamSeasonDocumentId,
  normalizeTeamIdentity,
} from '../../../model/teamIdentity.model.js'
import { clean } from '../leagues/leagueDoc.js'

export const teamSeasonDocRefById = teamSeasonDocumentId =>
  doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teamSeasons,
    clean(teamSeasonDocumentId)
  )

export const teamSeasonDocRef = ({ birthTeamDocumentId, seasonKey } = {}) => {
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  )

  if (!teamSeasonDocumentId) {
    throw new Error('Missing birth team or season identity')
  }

  return teamSeasonDocRefById(teamSeasonDocumentId)
}

// Persistence boundary for the one-document-per-season model.  Keep the
// root relation explicit on every season document; no writer should recover a
// season by reading or replacing Root.current/history arrays.
export const buildTeamSeasonDocumentData = ({
  team = {},
  season = {},
  seasonDoc = {},
  existingData = {},
} = {}) => {
  const identity = normalizeTeamIdentity({
    team,
    fallback: seasonDoc,
  })
  const birthTeamDocumentId = clean(
    identity.birthTeamDocumentId ||
    seasonDoc.birthTeamDocumentId ||
    seasonDoc.teamDocumentId
  )
  const seasonKey = clean(seasonDoc.seasonKey || season.seasonKey)
  const id = buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)

  if (!id) throw new Error('Missing canonical Team Season identity')

  return {
    ...seasonDoc,
    id,
    birthTeamId: clean(
      identity.birthTeamId ||
      seasonDoc.birthTeamId ||
      birthTeamDocumentId
    ),
    birthTeamDocumentId,
    createdAt: existingData.createdAt || seasonDoc.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}
