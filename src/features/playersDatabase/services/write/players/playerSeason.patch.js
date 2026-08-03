// features/playersDatabase/services/write/players/playerSeason.patch.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { buildSeasonKey, clean } from '../leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  normalizePlayerScoutProfiles,
  playerDocRef,
} from './playerDoc.model.js'
import { findPlayerSeasonRowIndex } from './playerSeason.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
export const patchPlayerSeason = async ({
  season = {},
  team = {},
  player = {},
  target = 'current',
  patch = {},
} = {}) => {
  const playerDocumentId = clean(
    player.playerDocumentId ||
    buildPlayerDocumentId(player)
  )
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) throw new Error('Missing player document id')
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        seasonId,
        updated: false,
        reason: 'playerDocMissing',
      }
    }

    const data = snapshot.data() || {}
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const fieldKey = isHistory ? 'history' : 'current'
    const rows = Array.isArray(data[fieldKey]) ? data[fieldKey] : []
    const seasonIndex = findPlayerSeasonRowIndex({
      rows,
      season: { ...season, seasonId, seasonKey },
      team,
    })
    if (seasonIndex === -1) {
      return {
        playerDocumentId,
        seasonId,
        seasonKey,
        updated: false,
        reason: 'playerSeasonMissing',
      }
    }

    const nextRows = rows.map((row, index) => (
      index === seasonIndex
        ? {
            ...row,
            ...patch,
            updatedAt: new Date().toISOString(),
          }
        : row
    ))

    transaction.set(
      ref,
      {
        [fieldKey]: nextRows,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      seasonId,
      seasonKey,
      updated: true,
    }
  })
}

export const updatePlayerSeasonNotes = ({ notes = '', ...payload } = {}) =>
  patchPlayerSeason({
    ...payload,
    patch: {
      notes: clean(notes),
    },
  })

export const updatePlayerSeasonUrl = ({ playerUrl = '', ...payload } = {}) =>
  patchPlayerSeason({
    ...payload,
    patch: {
      playerUrl: clean(playerUrl),
    },
  })

export const updatePlayerSeasonRole = ({
  player = {},
  primaryPosition = '',
  positionLayer = '',
  numShirt = '',
  ...payload
} = {}) =>
  patchPlayerSeason({
    ...payload,
    player,
    patch: {
      primaryPosition: clean(primaryPosition),
      positionLayer: clean(positionLayer),
      numShirt: clean(numShirt),
      scoutProfiles: normalizePlayerScoutProfiles(player),
    },
  })

export const removePlayerSeasonScoutProfile = ({
  profileId = '',
  ...payload
} = {}) => {
  const removeProfileId = clean(profileId)
  const currentProfiles = Array.isArray(payload.player?.scoutProfiles)
    ? payload.player.scoutProfiles
    : []

  return patchPlayerSeason({
    ...payload,
    patch: {
      scoutProfiles: removeProfileId
        ? currentProfiles.filter(
            profile => clean(profile.profileId) !== removeProfileId
          )
        : [],
    },
  })
}
