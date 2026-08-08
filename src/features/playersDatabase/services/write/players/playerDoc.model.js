// features/playersDatabase/services/write/players/playerDoc.model.js

import {
  deleteField,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  clean,
  toNumberOrZero,
} from '../leagues/leagueDoc.js'
import { pickDefinedValue } from '../../../model/value.model.js'
import {
  buildPlayerDocumentId as buildCanonicalPlayerDocumentId,
  buildPlayerMatchValues,
  normalizePlayerNameValue,
} from '../../../model/playerIdentity.model.js'

export const buildPlayerDocumentId = player =>
  buildCanonicalPlayerDocumentId(player)

export const normalizePlayerScoutProfiles = player => {
  const sourceProfiles = Array.isArray(player?.scoutSignals)
    ? player.scoutSignals
    : Array.isArray(player?.scoutProfiles)
      ? player.scoutProfiles
      : []

  return sourceProfiles
    .filter(profile => clean(profile.profileId))
    .map(profile => ({
      profileId: clean(profile.profileId),
      positionContext: clean(profile.positionContext),
      reliability: {
        level: clean(
          profile.reliability?.level ||
          profile.reliabilityLevel ||
          ''
        ),
        score: Number.isFinite(
          Number(
            pickDefinedValue(profile.reliability?.score, profile.reliabilityScore)
          )
        )
          ? Number(
              pickDefinedValue(profile.reliability?.score, profile.reliabilityScore)
            )
          : null,
      },
      score: Number.isFinite(Number(profile.score))
        ? Number(profile.score)
        : null,
    }))
}


export const normalizePlayerScoutCombinations = player => {
  const combinations = Array.isArray(player?.scoutCombinations)
    ? player.scoutCombinations
    : []

  return combinations
    .filter(combination => clean(combination?.id || combination?.combinationId))
    .map(combination => ({
      id: clean(combination.id || combination.combinationId),
      idIcon: clean(combination.idIcon),
      label: clean(combination.label),
      group: clean(combination.group),
      interest: clean(combination.interest),
      description: clean(combination.description),
      profileIds: [...new Set(
        (Array.isArray(combination.profileIds)
          ? combination.profileIds
          : Array.isArray(combination.matchedProfileIds)
            ? combination.matchedProfileIds
            : [])
          .map(clean)
          .filter(Boolean)
      )],
    }))
}

export const hasPlayerScoutProfiles = player =>
  normalizePlayerScoutProfiles(player).length > 0

export const getPlayerIdentityKeys = entity =>
  new Set(
    buildPlayerMatchValues(entity)
      .map(value => clean(value).toLowerCase())
      .filter(Boolean)
  )

export const isSamePlayerSource = (candidate = {}, player = {}) => {
  const candidateKeys = getPlayerIdentityKeys(candidate)
  const playerKeys = getPlayerIdentityKeys(player)

  for (const key of playerKeys) {
    if (candidateKeys.has(key)) return true
  }

  return false
}

export const playerDocRef = playerDocumentId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.players, clean(playerDocumentId))

export const buildPlayerBaseDoc = (
  player = {},
  currentData = {},
  season = {},
  team = {}
) => ({
  id: clean(player.playerDocumentId || buildPlayerDocumentId(player)),
  externalPlayerId: clean(player.externalPlayerId || currentData.externalPlayerId),
  fullName: clean(player.fullName || currentData.fullName),
  normalizedName: normalizePlayerNameValue(
    player.normalizedName || player.fullName || currentData.normalizedName
  ),
  birthYear: toNumberOrZero(
    pickDefinedValue(
      player.birthYear,
      season.birthYear,
      team.birthYear,
      currentData.birthYear,
    )
  ) || null,
  birthDate: pickDefinedValue(currentData.birthDate, null),
  status: clean(currentData.status),
  notes: clean(player.rootNotes || currentData.notes),
  primaryPosition: clean(player.primaryPosition || currentData.primaryPosition),
  positionLayer: clean(player.positionLayer || currentData.positionLayer),
  numShirt: clean(player.numShirt || currentData.numShirt),
  current: Array.isArray(currentData.current) ? currentData.current : [],
  history: Array.isArray(currentData.history) ? currentData.history : [],
  scoutProfiles: deleteField(),
  createdAt: currentData.createdAt || serverTimestamp(),
  updatedAt: serverTimestamp(),
})
