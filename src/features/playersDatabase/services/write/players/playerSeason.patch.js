// src/features/playersDatabase/services/write/players/playerSeason.patch.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  normalizePlayerScoutCombinations,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
  playerDocRef,
} from './playerDoc.model.js'
import { findPlayerSeasonRowIndex } from './playerSeason.model.js'
import { removePlayerScoutProfileFromComputedState } from '../../../domain/orchestration/mutatePlayerScoutProfileState.js'
import {
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
} from './scoutingPlayerLifecycle.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
export const patchPlayerSeason = async ({
  season = {},
  team = {},
  player = {},
  target = 'current',
  patch = {},
  buildRootPatch = null,
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
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
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

    const rootPatch = typeof buildRootPatch === 'function'
      ? buildRootPatch({
          data,
          fieldKey,
          nextRows,
        })
      : {}

    transaction.set(
      ref,
      {
        ...rootPatch,
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

export const removePlayerSeasonScoutProfile = ({ profileId = '', ...payload } = {}) => {
  const removeProfileId = clean(profileId)
  if (!removeProfileId) throw new Error('Missing scout profile id')

  const nextPlayer = removePlayerScoutProfileFromComputedState({
    player: payload.player || {},
    profileId: removeProfileId,
  })

  return patchPlayerSeason({
    ...payload,
    player: nextPlayer,
    patch: {
      scoutProfiles: normalizePlayerScoutProfiles(nextPlayer),
      scoutCombinations: normalizePlayerScoutCombinations(nextPlayer),
      ...normalizePlayerScoutStory(nextPlayer),
    },
    buildRootPatch: ({ data, fieldKey, nextRows }) => {
      const currentTracking = normalizeScoutingPlayerTracking({
        ...(data.tracking || {}),
        favorite:
          data.tracking?.favorite === true ||
          data.favorite === true,
        watchlist:
          data.tracking?.watchlist === true ||
          data.watchlist === true,
      })
      const nextDocument = {
        ...data,
        [fieldKey]: nextRows,
        tracking: currentTracking,
      }

      return {
        tracking: {
          ...currentTracking,
          trackingReasons: resolvePlayerTrackingReasons(nextDocument),
        },
      }
    },
  })
}
