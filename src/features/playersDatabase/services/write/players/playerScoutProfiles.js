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
  buildPlayerSeasonCompactProjection,
  removePlayerSeasonRow,
} from './playerSeason.model.js'
import { upsertProfiledPlayerDoc } from './playerDoc.upsert.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerLifecycleTrackingReason,
  resolvePlayerTrackingReasons,
  shouldHavePlayerDocument,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'

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
  const playerDocumentId = clean(player.playerDocumentId) || buildPlayerDocumentId(player)
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
    const currentWithoutSeason = removePlayerSeasonRow({
      rows: baseDoc.current,
      season: seasonScope,
      team,
    })
    const historyWithoutSeason = removePlayerSeasonRow({
      rows: baseDoc.history,
      season: seasonScope,
      team,
    })
    const hadSeasonRow = (
      currentWithoutSeason.length !== baseDoc.current.length ||
      historyWithoutSeason.length !== baseDoc.history.length
    )
    if (!hadSeasonRow) {
      return {
        playerDocumentId,
        updated: false,
        skipped: true,
        reason: 'playerSeasonMissing',
      }
    }
    const seasonDoc = buildPlayerSeasonCompactProjection({
      season: seasonScope,
      team,
      player: {
        ...player,
        scoutSignals: [],
        scoutProfiles: [],
        scoutCombinations: [],
      },
    })
    const nextCurrent = isHistory
      ? currentWithoutSeason
      : [...currentWithoutSeason, seasonDoc]
    const nextHistory = isHistory
      ? [...historyWithoutSeason, seasonDoc]
      : historyWithoutSeason

    const nextTrackingSource = {
      ...currentData,
      current: nextCurrent,
      history: nextHistory,
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
      current: nextCurrent,
      history: nextHistory,
    }
    const nextPlayerDocument = {
      ...currentData,
      ...nextPayload,
      current: nextCurrent,
      history: nextHistory,
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

    if (!shouldHavePlayerDocument(nextPlayerDocument)) {
      transaction.delete(ref)
      return {
        playerDocumentId,
        updated: true,
        deleted: true,
        changed: true,
        scoutProfilesCount: 0,
      }
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

export async function clearExistingPlayerSeasonProfilesMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
} = {}) {
  const results = []

  for (const player of (Array.isArray(players) ? players : [])) {
    if (!clean(player?.playerDocumentId)) continue
    results.push(await clearExistingPlayerSeasonProfiles({
      season,
      team,
      target,
      player,
    }))
  }

  return {
    rowsCount: results.filter(result => result.updated && result.changed).length,
    deletedPlayerDocumentIds: results
      .filter(result => result.deleted)
      .map(result => result.playerDocumentId)
      .filter(Boolean),
    skippedCount: results.filter(result => result.skipped).length,
    playerDocumentIds: results.map(result => result.playerDocumentId).filter(Boolean),
    results,
  }
}

export async function upsertProfiledPlayerDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
  teamSeasonDocument = null,
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
      teamSeasonDocument,
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

const resolveTrackingDocReason = resolvePlayerLifecycleTrackingReason

export async function syncPlayerRoleAndScoutProfileDoc({
  season = {},
  team = {},
  target = 'current',
  player = {},
  teamSeasonDocument = null,
  verificationAnswers = null,
  confirmPositionContext = false,
} = {}) {
  return upsertProfiledPlayerDoc({
    season,
    team,
    target,
    player,
    teamSeasonDocument,
    verificationAnswers,
    confirmPositionContext,
    resolveLifecycleAfterCalculation: true,
  })
}

export async function syncPlayerScoutProfileDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
  teamSeasonDocument = null,
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
        teamSeasonDocument,
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
