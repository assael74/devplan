// features/playersDatabase/services/write/players/playerScoutProfiles.js

import { serverTimestamp } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import {
  buildSeasonKey,
  clean,
} from '../leagues/leagueDoc.js'
import {
  buildPlayerBaseDoc,
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  playerDocRef,
} from './playerDoc.model.js'
import {
  buildPlayerSeasonDoc,
  findPlayerSeasonRowIndex,
  upsertSeasonRows,
} from './playerSeason.model.js'
import { upsertProfiledPlayerDoc } from './playerDoc.upsert.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const hasProfiles = source => (
  (Array.isArray(source?.scoutProfiles) && source.scoutProfiles.length > 0) ||
  (Array.isArray(source?.scoutSignals) && source.scoutSignals.length > 0)
)

const hasProfilesInPlayerDocument = data => (
  hasProfiles(data) ||
  ['current', 'history'].some(target => (
    (Array.isArray(data?.[target]) ? data[target] : []).some(hasProfiles)
  ))
)

const buildCompatibleTracking = data => {
  const current = normalizeScoutingPlayerTracking({
    ...(data?.tracking || {}),
    favorite:
      data?.tracking?.favorite === true ||
      data?.favorite === true,
    watchlist:
      data?.tracking?.watchlist === true ||
      data?.watchlist === true,
  })
  const reasons = [
    ...current.trackingReasons,
    current.favorite
      ? SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE
      : '',
    current.watchlist
      ? SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST
      : '',
    hasProfilesInPlayerDocument(data)
      ? SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
      : '',
  ].filter(Boolean)

  return {
    ...current,
    trackingReasons: [...new Set(reasons)],
  }
}

export const clearExistingPlayerSeasonProfiles = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
} = {}) => {
  const playerDocumentId = buildPlayerDocumentId(player)
  const seasonId = clean(season.seasonId)
  if (!playerDocumentId) return {
    skipped: true,
    reason: 'missingPlayerDocumentId',
  }
  if (!seasonId) throw new Error('Missing season id')

  const ref = playerDocRef(playerDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerDocMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const baseDoc = buildPlayerBaseDoc(
      {
        ...player,
        playerDocumentId,
      },
      currentData,
      season,
      team
    )
    const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
    const isHistory = clean(target) === 'history'
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeasonIndex = findPlayerSeasonRowIndex({
      rows,
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team,
    })
    if (existingSeasonIndex === -1) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerSeasonMissing',
      }
    }
    const seasonDoc = buildPlayerSeasonDoc({
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team,
      player: {
        ...player,
        scoutSignals: [],
        scoutProfiles: [],
        scoutCombinations: [],
      },
    })
    const nextRows = upsertSeasonRows({
      rows,
      season: {
        ...season,
        seasonId,
        seasonKey,
      },
      team,
      seasonDoc,
    })

    transaction.set(
      ref,
      {
        favorite:
          currentData.favorite === true ||
          currentData.tracking?.favorite === true,
        tracking: buildCompatibleTracking(currentData),
        verification: normalizeScoutingPlayerVerification(
          currentData.verification
        ),
        events: normalizeScoutingPlayerEvents(currentData.events),
        ...(isHistory ? { history: nextRows } : { current: nextRows }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      updated: true,
      scoutProfilesCount: 0,
    }
  })
}

export async function upsertProfiledPlayerDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
  teamDocument = null,
} = {}) {
  const profiledPlayers = (Array.isArray(players) ? players : [])
    .filter(hasPlayerScoutProfiles)
  const results = []

  for (const player of profiledPlayers) {
    results.push(await upsertProfiledPlayerDoc({
      season,
      team,
      target,
      player,
      teamDocument,
    }))
  }

  return {
    rowsCount: results.length,
    createdCount: results.filter(result => result.created).length,
    playerDocumentIds: results
      .map(result => result.playerDocumentId)
      .filter(Boolean),
  }
}

export async function syncPlayerRoleAndScoutProfileDoc({
  season = {},
  team = {},
  target = 'current',
  player = {},
  scoutSyncMode = 'replace',
  teamDocument = null,
} = {}) {
  if (!hasPlayerScoutProfiles(player) && scoutSyncMode === 'preserve') {
    return {
      playerDocumentId: buildPlayerDocumentId(player),
      updated: false,
      skipped: true,
      reason: 'preserveExistingProfiles',
    }
  }

  return hasPlayerScoutProfiles(player)
    ? upsertProfiledPlayerDoc({
        season,
        team,
        target,
        player,
        teamDocument,
      })
    : clearExistingPlayerSeasonProfiles({
        season,
        team,
        target,
        player,
      })
}

export async function syncPlayerScoutProfileDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
  scoutSyncMode = 'replace',
  teamDocument = null,
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const results = []
  const failures = []

  for (const player of safePlayers) {
    try {
      results.push(await syncPlayerRoleAndScoutProfileDoc({
        season,
        team,
        target,
        player,
        scoutSyncMode,
        teamDocument,
      }))
    } catch (error) {
      failures.push({
        playerDocumentId: clean(
          player.playerDocumentId ||
          buildPlayerDocumentId(player)
        ),
        playerId: clean(player.playerId || player.externalPlayerId),
        fullName: clean(player.fullName || player.matchedPlayerName),
        message: clean(error?.message) || 'Player document sync failed',
      })
    }
  }

  return {
    rowsCount: results.filter(result => !result.skipped).length,
    createdCount: results.filter(result => result.created).length,
    clearedCount: results.filter(
      result => result.updated && result.scoutProfilesCount === 0
    ).length,
    skippedCount: results.filter(result => result.skipped).length,
    failedCount: failures.length,
    failures,
    playerDocumentIds: results
      .map(result => result.playerDocumentId)
      .filter(Boolean),
  }
}
