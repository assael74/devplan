// src/features/playersDatabase/services/write/players/playerSeason.patch.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  normalizePlayerScoutCombinationIds,
  normalizePlayerScoutProfiles,
  normalizePlayerScoutStory,
  playerDocRef,
} from './playerDoc.model.js'
import { resolveWritablePlayerDocumentId } from '../../../model/playerIdentity.model.js'
import {
  buildPlayerSeasonCompactProjection,
  findPlayerSeasonRowIndex,
} from './playerSeason.model.js'
import { removePlayerScoutProfileFromComputedState } from '../../../domain/orchestration/mutatePlayerScoutProfileState.js'
import {
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
  shouldHavePlayerDocument,
} from './scoutingPlayerLifecycle.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const normalizeComparableValue = value => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const isPatchUnchanged = ({ current = {}, patch = {} } = {}) => (
  Object.keys(patch).every(key => (
    JSON.stringify(normalizeComparableValue(current[key])) ===
    JSON.stringify(normalizeComparableValue(patch[key]))
  ))
)
export const patchPlayerSeason = async ({
  season = {},
  team = {},
  player = {},
  target = 'current',
  patch = {},
  buildPatch = null,
  buildRootPatch = null,
} = {}) => {
  const playerDocumentId = clean(resolveWritablePlayerDocumentId(player))
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

    const currentSeasonRow = rows[seasonIndex] || {}
    const resolvedPatch = typeof buildPatch === 'function'
      ? buildPatch({
          data,
          currentSeasonRow,
          fieldKey,
          season: {
            ...season,
            seasonId,
            seasonKey,
          },
        })
      : patch
    const compactSeasonRow = buildPlayerSeasonCompactProjection({
      season: {
        ...currentSeasonRow,
        ...season,
        seasonId,
        seasonKey,
        seasonStatus: isHistory ? 'completed' : 'active',
      },
      team: {
        ...currentSeasonRow,
        ...team,
      },
      player: {
        ...currentSeasonRow,
        ...resolvedPatch,
      },
    })
    const legacySeasonFieldsChanged = (
      JSON.stringify(normalizeComparableValue(currentSeasonRow)) !==
      JSON.stringify(normalizeComparableValue(compactSeasonRow))
    )
    const seasonChanged = (
      !isPatchUnchanged({
        current: currentSeasonRow,
        patch: resolvedPatch,
      }) ||
      legacySeasonFieldsChanged
    )
    const candidateRows = rows.map((row, index) => (
      index === seasonIndex
        ? compactSeasonRow
        : row
    ))

    const rootPatch = typeof buildRootPatch === 'function'
      ? buildRootPatch({
          data,
          fieldKey,
          nextRows: candidateRows,
        })
      : {}
    const rootChanged = !isPatchUnchanged({
      current: data,
      patch: rootPatch,
    })

    if (!seasonChanged && !rootChanged) {
      return {
        playerDocumentId,
        seasonId,
        seasonKey,
        updated: true,
        changed: false,
        writeSkipped: true,
        player: currentSeasonRow,
      }
    }

    const nextRows = seasonChanged
      ? candidateRows.map((row, index) => (
          index === seasonIndex
            ? {
                ...row,
                updatedAt: new Date().toISOString(),
              }
            : row
        ))
      : rows
    const nextSeasonRow = nextRows[seasonIndex] || currentSeasonRow

    transaction.set(
      ref,
      {
        ...rootPatch,
        ...(seasonChanged ? { [fieldKey]: nextRows } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      seasonId,
      seasonKey,
      updated: true,
      changed: true,
      writeSkipped: false,
      player: nextSeasonRow,
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

// This is deliberately a pure state builder.  The profile-removal flow uses it
// together with the Team Season and SearchIndex writes in one transaction; the
// small wrapper below remains available to callers that only own Player state.
export const buildPlayerSeasonScoutProfileRemoval = ({
  profileId = '',
  season = {},
  team = {},
  player = {},
  target = 'current',
  data = {},
} = {}) => {
  const removeProfileId = clean(profileId)
  if (!removeProfileId) throw new Error('Missing scout profile id')

  const playerDocumentId = clean(resolveWritablePlayerDocumentId(player))
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) throw new Error('Missing player document id')
  if (!seasonId) throw new Error('Missing season id')

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

  const currentSeasonRow = rows[seasonIndex] || {}
  const nextPlayer = removePlayerScoutProfileFromComputedState({
    player: {
      ...player,
      ...data,
      ...currentSeasonRow,
    },
    profileId: removeProfileId,
  })
  const compactSeasonRow = buildPlayerSeasonCompactProjection({
    season: {
      ...currentSeasonRow,
      ...season,
      seasonId,
      seasonKey,
      seasonStatus: isHistory ? 'completed' : 'active',
    },
    team: {
      ...currentSeasonRow,
      ...team,
    },
    player: nextPlayer,
  })
  const nextRows = rows.map((row, index) => (
    index === seasonIndex ? compactSeasonRow : row
  ))
  const currentTracking = normalizeScoutingPlayerTracking({
    ...(data.tracking || {}),
    favorite: data.tracking?.favorite === true || data.favorite === true,
    watchlist: data.tracking?.watchlist === true || data.watchlist === true,
  })
  const nextDocument = {
    ...data,
    [fieldKey]: nextRows,
    tracking: currentTracking,
  }
  const tracking = {
    ...currentTracking,
    trackingReasons: resolvePlayerTrackingReasons(nextDocument),
  }
  const lifecycleDocument = {
    ...nextDocument,
    tracking,
  }

  return {
    playerDocumentId,
    seasonId,
    seasonKey,
    fieldKey,
    currentSeasonRow,
    player: nextPlayer,
    seasonRow: compactSeasonRow,
    tracking,
    nextDocument: lifecycleDocument,
    shouldDelete: !shouldHavePlayerDocument(lifecycleDocument),
    updated: true,
  }
}
