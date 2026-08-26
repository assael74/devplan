// src/features/playersDatabase/services/write/players/playerScoutProfiles.js

import {
  collection,
  documentId,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
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
import { ensureScoutingPlayerDoc } from './scoutingPlayerDoc.ensure.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'
import { buildPlayerScoutStatsLoadMeasurementHistory } from '../../../model/playerScoutMeasurement.model.js'

import {
  trackedGetDocs,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'


const PLAYER_DOCUMENT_LOOKUP_LIMIT = 30

const chunkValues = (values, size) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

export async function resolveExistingPlayerDocumentIds(players = []) {
  const playerDocumentIds = [...new Set(
    (Array.isArray(players) ? players : [])
      .map(player => buildPlayerDocumentId(player))
      .filter(Boolean)
  )]
  const existingIds = new Set()

  for (const idChunk of chunkValues(playerDocumentIds, PLAYER_DOCUMENT_LOOKUP_LIMIT)) {
    const snapshot = await trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
        where(documentId(), 'in', idChunk)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutProfileDocs-existing',
        operationSubtype: 'maintenance-query',
      }
    )

    snapshot.docs.forEach(playerDocument => existingIds.add(playerDocument.id))
  }

  return existingIds
}

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
        if (key === 'updatedAt') return result
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const isSamePersistedState = (current = {}, next = {}) => (
  JSON.stringify(normalizeComparableValue(current)) ===
  JSON.stringify(normalizeComparableValue(next))
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

  return {
    ...current,
    trackingReasons: resolvePlayerTrackingReasons({
      ...data,
      tracking: current,
    }),
  }
}

export const clearExistingPlayerSeasonProfiles = async ({ season = {}, team = {}, target = 'current', player = {} } = {}) => {
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
    const seasonStatus = isHistory || clean(season.seasonStatus) === 'completed'
      ? 'completed'
      : 'active'
    const seasonScope = {
      ...season,
      seasonId,
      seasonKey,
      seasonStatus,
    }
    const rows = isHistory ? baseDoc.history : baseDoc.current
    const existingSeasonIndex = findPlayerSeasonRowIndex({
      rows,
      season: seasonScope,
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
    const existingSeasonRow = rows[existingSeasonIndex] || null
    const scoutStatsLoadMeasurementHistory = buildPlayerScoutStatsLoadMeasurementHistory({
      existingHistory: existingSeasonRow?.scoutStatsLoadMeasurementHistory,
      measurements: player.scoutStatsLoadMeasurements,
    })
    const seasonDoc = buildPlayerSeasonDoc({
      season: seasonScope,
      team,
      player: {
        ...player,
        scoutSignals: [],
        scoutProfiles: [],
        scoutCombinations: [],
        scoutStatsLoadMeasurementHistory,
      },
    })
    const nextRows = upsertSeasonRows({
      rows,
      season: seasonScope,
      team,
      seasonDoc,
    })

    const nextTrackingSource = {
      ...currentData,
      current: isHistory ? baseDoc.current : nextRows,
      history: isHistory ? nextRows : baseDoc.history,
    }

    const nextPayload = {
      favorite:
        currentData.favorite === true ||
        currentData.tracking?.favorite === true,
      tracking: buildCompatibleTracking(nextTrackingSource),
      verification: normalizeScoutingPlayerVerification(
        currentData.verification
      ),
      events: normalizeScoutingPlayerEvents(currentData.events),
      ...(isHistory ? { history: nextRows } : { current: nextRows }),
    }
    const currentPayload = {
      favorite: currentData.favorite === true,
      tracking: currentData.tracking || {},
      verification: currentData.verification || {},
      events: currentData.events || [],
      ...(isHistory
        ? { history: Array.isArray(currentData.history) ? currentData.history : [] }
        : { current: Array.isArray(currentData.current) ? currentData.current : [] }),
    }

    if (isSamePersistedState(currentPayload, nextPayload)) {
      return {
        playerDocumentId,
        updated: true,
        changed: false,
        writeSkipped: true,
        scoutProfilesCount: 0,
      }
    }

    transaction.set(
      ref,
      {
        ...nextPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      playerDocumentId,
      updated: true,
      changed: true,
      writeSkipped: false,
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

const resolveTrackingDocReason = player => {
  if (hasPlayerScoutProfiles(player)) {
    return SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
  }

  const reasons = resolvePlayerTrackingReasons(player)
  const reasonPriority = [
    SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER,
    SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE,
    SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST,
    SCOUTING_PLAYER_TRACKING_REASONS.MANUAL,
  ]

  return reasonPriority.find(reason => reasons.includes(reason)) || ''
}

const resolveTransferContext = player => (
  player?.scoutTransferContext ||
  player?.scoutTrajectory?.latestTransfer ||
  {}
)

export async function syncPlayerRoleAndScoutProfileDoc({
  season = {},
  team = {},
  target = 'current',
  player = {},
  teamDocument = null,
} = {}) {
  const trackingReason = resolveTrackingDocReason(player)

  if (trackingReason === SCOUTING_PLAYER_TRACKING_REASONS.PROFILE) {
    return upsertProfiledPlayerDoc({
      season,
      team,
      target,
      player,
      teamDocument,
    })
  }

  if (trackingReason) {
    return ensureScoutingPlayerDoc({
      season,
      team,
      target,
      player,
      teamDocument,
      reason: trackingReason,
      transfer: resolveTransferContext(player),
    })
  }

  return clearExistingPlayerSeasonProfiles({
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
  teamDocument = null,
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const lookupPlayers = safePlayers.filter(player => (
    !hasPlayerScoutProfiles(player) &&
    !clean(player.playerDocumentId) &&
    !resolveTrackingDocReason(player)
  ))
  const existingPlayerDocumentIds = lookupPlayers.length
    ? await resolveExistingPlayerDocumentIds(lookupPlayers)
    : new Set()
  const playersToSync = safePlayers.filter(player => (
    hasPlayerScoutProfiles(player) ||
    Boolean(resolveTrackingDocReason(player)) ||
    Boolean(clean(player.playerDocumentId)) ||
    existingPlayerDocumentIds.has(buildPlayerDocumentId(player))
  ))
  const skippedUntrackedCount = safePlayers.length - playersToSync.length
  const results = []
  const failures = []

  for (const player of playersToSync) {
    try {
      results.push(await syncPlayerRoleAndScoutProfileDoc({
        season,
        team,
        target,
        player,
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
    unchangedCount: results.filter(result => result.writeSkipped).length,
    skippedCount: skippedUntrackedCount + results.filter(result => result.skipped).length,
    failedCount: failures.length,
    failures,
    playerDocumentIds: results
      .map(result => result.playerDocumentId)
      .filter(Boolean),
    writtenPlayerDocumentIds: results
      .filter(result => (
        !result.skipped &&
        result.writeSkipped !== true &&
        clean(result.playerDocumentId)
      ))
      .map(result => clean(result.playerDocumentId)),
    scoutedPlayers: results
      .map(result => result.scoutedPlayer)
      .filter(Boolean),
  }
}
