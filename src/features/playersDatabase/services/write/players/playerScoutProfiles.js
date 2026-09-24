// src/features/playersDatabase/services/write/players/playerScoutProfiles.js

import { chunkValues } from '../../shared/chunkValues.js'
import {
  collection,
  documentId,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { clean } from '../leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
} from './playerDoc.model.js'
import {
  buildClearPlayerSeasonProfilesPlan,
  buildProfiledPlayerDocPlan,
} from './playerDoc.plan.js'
import { upsertProfiledPlayerDoc } from './playerDoc.upsert.js'
import { resolvePlayerLifecycleTrackingReason } from './scoutingPlayerLifecycle.model.js'
import {
  buildPlayerScoutState,
  isScoutCalculationExcludedRosterStatus,
} from '../../../domain/orchestration/buildPlayerScoutState.js'

import { trackedGetDocs } from '../../../../../services/firestore/usage/index.js'


const PLAYER_DOCUMENT_LOOKUP_LIMIT = 30


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

export async function resolvePlayerDocumentSnapshots(players = []) {
  const playerDocumentIds = [...new Set(
    (Array.isArray(players) ? players : [])
      .map(player => buildPlayerDocumentId(player))
      .filter(Boolean)
  )]
  const documents = new Map()

  for (const idChunk of chunkValues(playerDocumentIds, PLAYER_DOCUMENT_LOOKUP_LIMIT)) {
    const snapshot = await trackedGetDocs(
      query(
        collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
        where(documentId(), 'in', idChunk)
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutProfileDocs-snapshots',
        operationSubtype: 'maintenance-query',
      }
    )

    snapshot.docs.forEach(playerDocument => {
      documents.set(playerDocument.id, playerDocument.data() || {})
    })
  }

  return documents
}


export const clearExistingPlayerSeasonProfiles = async ({
  season = {},
  team = {},
  target = 'current',
  player = {},
  retainPlayerDocument = false,
  approvedPlan = null,
} = {}) => {
  let plan = approvedPlan

  if (!plan) {
    const playerDocumentId = clean(player.playerDocumentId) || buildPlayerDocumentId(player)
    if (!playerDocumentId) return { skipped: true, reason: 'missingPlayerDocumentId' }

    const playerDocuments = await resolvePlayerDocumentSnapshots([{ ...player, playerDocumentId }])
    const currentData = playerDocuments.get(playerDocumentId) || {}
    plan = buildClearPlayerSeasonProfilesPlan({
      season,
      team,
      target,
      player: { ...player, playerDocumentId },
      currentData,
      playerDocumentExists: playerDocuments.has(playerDocumentId),
      retainPlayerDocument,
    })
  }

  return upsertProfiledPlayerDoc({ approvedPlan: plan })
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
    .filter(player => !isScoutCalculationExcludedRosterStatus(player))
    .filter(hasPlayerScoutProfiles)
  const playerDocuments = await resolvePlayerDocumentSnapshots(profiledPlayers)
  const trackedAt = new Date().toISOString()
  const plans = profiledPlayers.map(player => {
    const playerDocumentId = buildPlayerDocumentId(player)
    const currentData = playerDocuments.get(playerDocumentId) || {}

    return buildProfiledPlayerDocPlan({
      season,
      team,
      target,
      player,
      teamSeasonDocument,
      currentData,
      playerDocumentExists: playerDocuments.has(playerDocumentId),
      trackedAt,
    })
  })
  const results = []

  for (const approvedPlan of plans) {
    results.push(await upsertProfiledPlayerDoc({ approvedPlan }))
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
} = {}) {
  // A non-current participant remains in the Team Season for historical
  // completeness, but is outside the current-team scout scope.
  // Returning the cleared scout state is important: the caller uses it to
  // clear a previously calculated profile from the Team Season projection.
  if (isScoutCalculationExcludedRosterStatus(player)) {
    const playerDocumentId = clean(player.playerDocumentId) || buildPlayerDocumentId(player)
    const playerDocuments = playerDocumentId
      ? await resolvePlayerDocumentSnapshots([{
          ...player,
          playerDocumentId,
        }])
      : new Map()
    const playerDocumentExists = playerDocuments.has(playerDocumentId)
    const currentData = playerDocuments.get(playerDocumentId) || {}
    const scoutedPlayer = {
      ...buildPlayerScoutState({ player, team, season }),
      ...(playerDocumentExists ? { playerDocumentId } : {}),
    }
    const approvedPlan = playerDocumentExists
      ? buildClearPlayerSeasonProfilesPlan({
          season,
          team,
          target,
          retainPlayerDocument: true,
          player: {
            ...player,
            playerDocumentId,
          },
          currentData,
          playerDocumentExists,
        })
      : null
    const cleared = approvedPlan
      ? await upsertProfiledPlayerDoc({ approvedPlan })
      : {
          skipped: true,
          reason: 'outOfRosterScopePlayerDocumentNotCreated',
        }

    return {
      ...cleared,
      playerDocumentId,
      created: false,
      scoutProfilesCount: 0,
      lifecycle: 'out_of_roster_scope',
      scoutedPlayer,
    }
  }

  const playerDocumentId = buildPlayerDocumentId(player)
  const playerDocuments = await resolvePlayerDocumentSnapshots([player])
  const currentData = playerDocuments.get(playerDocumentId) || {}
  const approvedPlan = buildProfiledPlayerDocPlan({
    season,
    team,
    target,
    player,
    teamSeasonDocument,
    currentData,
    playerDocumentExists: playerDocuments.has(playerDocumentId),
    verificationAnswers,
    resolveLifecycleAfterCalculation: true,
    trackedAt: new Date().toISOString(),
  })

  return upsertProfiledPlayerDoc({ approvedPlan })
}

export async function preparePlayerScoutProfileDocsPlan({
  season = {},
  team = {},
  target = 'current',
  players = [],
  teamSeasonDocument = null,
  trackedAt = '',
} = {}) {
  const safePlayers = Array.isArray(players) ? players : []
  const effectiveTrackedAt = clean(trackedAt) || new Date().toISOString()
  const playerDocuments = await resolvePlayerDocumentSnapshots(safePlayers)
  const entries = []
  let skippedUntrackedCount = 0

  for (const player of safePlayers) {
    const playerDocumentId = clean(player.playerDocumentId) || buildPlayerDocumentId(player)
    const playerDocumentExists = playerDocuments.has(playerDocumentId)
    const currentData = playerDocuments.get(playerDocumentId) || {}
    const shouldSync = (
      isScoutCalculationExcludedRosterStatus(player) ||
      hasPlayerScoutProfiles(player) ||
      Boolean(resolveTrackingDocReason(player)) ||
      Boolean(clean(player.playerDocumentId)) ||
      playerDocumentExists
    )

    if (!shouldSync) {
      skippedUntrackedCount += 1
      continue
    }

    if (isScoutCalculationExcludedRosterStatus(player)) {
      const scoutedPlayer = {
        ...buildPlayerScoutState({ player, team, season }),
        ...(playerDocumentExists ? { playerDocumentId } : {}),
      }
      const approvedPlan = playerDocumentExists
        ? buildClearPlayerSeasonProfilesPlan({
            season,
            team,
            target,
            retainPlayerDocument: true,
            player: { ...player, playerDocumentId },
            currentData,
            playerDocumentExists,
          })
        : {
            playerDocumentId,
            action: 'skip',
            skipped: true,
            reason: 'outOfRosterScopePlayerDocumentNotCreated',
          }

      entries.push({
        player,
        approvedPlan,
        scoutedPlayer,
        lifecycle: 'out_of_roster_scope',
      })
      continue
    }

    const approvedPlan = buildProfiledPlayerDocPlan({
      season,
      team,
      target,
      player,
      teamSeasonDocument,
      currentData,
      playerDocumentExists,
      resolveLifecycleAfterCalculation: true,
      trackedAt: effectiveTrackedAt,
    })

    entries.push({
      player,
      approvedPlan,
      scoutedPlayer: approvedPlan.scoutedPlayer || null,
      lifecycle: approvedPlan.lifecycle || '',
    })
  }

  return {
    trackedAt: effectiveTrackedAt,
    skippedUntrackedCount,
    entries,
    scoutedPlayers: entries.map(entry => entry.scoutedPlayer).filter(Boolean),
  }
}

export async function syncPlayerScoutProfileDocsMany({
  season = {},
  team = {},
  target = 'current',
  players = [],
  teamSeasonDocument = null,
  beforeEach = null,
  approvedPlan = null,
} = {}) {
  const prepared = approvedPlan || await preparePlayerScoutProfileDocsPlan({
    season,
    team,
    target,
    players,
    teamSeasonDocument,
  })
  const results = []
  const failures = []

  for (const entry of (Array.isArray(prepared.entries) ? prepared.entries : [])) {
    const { player = {}, approvedPlan: playerPlan, scoutedPlayer = null, lifecycle = '' } = entry
    try {
      if (typeof beforeEach === 'function') await beforeEach(player)
      const written = await upsertProfiledPlayerDoc({ approvedPlan: playerPlan })
      results.push({
        ...written,
        ...(scoutedPlayer ? { scoutedPlayer } : {}),
        ...(lifecycle ? { lifecycle } : {}),
        scoutProfilesCount: Number.isFinite(written?.scoutProfilesCount)
          ? written.scoutProfilesCount
          : (Array.isArray(scoutedPlayer?.scoutProfiles) ? scoutedPlayer.scoutProfiles.length : 0),
      })
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
    skippedCount: Number(prepared.skippedUntrackedCount || 0) + results.filter(result => result.skipped).length,
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
    scoutedPlayers: Array.isArray(prepared.scoutedPlayers)
      ? prepared.scoutedPlayers
      : results.map(result => result.scoutedPlayer).filter(Boolean),
  }
}
