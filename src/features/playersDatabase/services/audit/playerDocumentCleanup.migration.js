// src/features/playersDatabase/services/audit/playerDocumentCleanup.migration.js

import {
  collection,
  documentId,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  createTrackedWriteBatch,
  trackedGetDocsFromServer,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { clean } from '../write/leagues/leagueDoc.js'
import {
  buildPlayerDocumentId,
  normalizePlayerNameValue,
} from '../../model/playerIdentity.model.js'
import {
  normalizeTeamIdentity,
} from '../../model/teamIdentity.model.js'
import {
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from '../write/players/scoutingPlayerLifecycle.model.js'

const FIRESTORE_IN_LIMIT = 30
const WRITE_BATCH_LIMIT = 400
const TRANSIENT_RETRY_MAX_ATTEMPTS = 4
const TRANSIENT_RETRY_DELAYS_MS = Object.freeze([
  2000,
  5000,
  10000,
])

const sleep = delayMs => new Promise(resolve => {
  setTimeout(resolve, delayMs)
})

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const chunk = (values, size) => {
  const rows = Array.isArray(values) ? values : []
  const result = []

  for (let index = 0; index < rows.length; index += size) {
    result.push(rows.slice(index, index + size))
  }

  return result
}

const isRealTransferContext = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const fromClubId = clean(value.fromClubId)
  const toClubId = clean(value.toClubId)

  return Boolean(
    fromClubId &&
    toClubId &&
    fromClubId !== toClubId
  )
}

export const hasRealPlayerTransfer = player => {
  const sources = [
    player,
    ...(Array.isArray(player?.current) ? player.current : []),
    ...(Array.isArray(player?.history) ? player.history : []),
  ]

  return sources.some(source => (
    isRealTransferContext(source?.scoutTransferContext) ||
    isRealTransferContext(source?.scoutTrajectory?.latestTransfer)
  ))
}

const addIdentityKey = ({ keys, prefix, value }) => {
  const normalizedValue = prefix === 'name'
    ? normalizePlayerNameValue(value)
    : clean(value)

  if (!normalizedValue) return
  keys.add(`${prefix}:${normalizedValue}`)
}

const buildPlayerIdentityKeys = ({
  player = {},
  playerDocumentId = '',
} = {}) => {
  const keys = new Set()
  const sources = [
    player,
    ...(Array.isArray(player?.current) ? player.current : []),
    ...(Array.isArray(player?.history) ? player.history : []),
  ]

  addIdentityKey({
    keys,
    prefix: 'document',
    value: playerDocumentId,
  })

  sources.forEach(source => {
    addIdentityKey({
      keys,
      prefix: 'document',
      value: source?.playerDocumentId,
    })
    addIdentityKey({
      keys,
      prefix: 'document',
      value: buildPlayerDocumentId(source),
    })
    addIdentityKey({
      keys,
      prefix: 'external',
      value: source?.externalPlayerId,
    })
    addIdentityKey({
      keys,
      prefix: 'internal',
      value: source?.matchedPlayerId,
    })
    addIdentityKey({
      keys,
      prefix: 'internal',
      value: source?.playerId,
    })
    addIdentityKey({
      keys,
      prefix: 'name',
      value: source?.normalizedName,
    })
    addIdentityKey({
      keys,
      prefix: 'name',
      value: source?.matchedPlayerName,
    })
    addIdentityKey({
      keys,
      prefix: 'name',
      value: source?.fullName,
    })
    addIdentityKey({
      keys,
      prefix: 'name',
      value: source?.originalFullName,
    })
  })

  return [...keys]
}

const buildTargetIdentityIndex = playerRows => {
  const idsByIdentityKey = new Map()

  ;(Array.isArray(playerRows) ? playerRows : []).forEach(row => {
    const playerDocumentId = clean(row?.id)
    if (!playerDocumentId) return

    buildPlayerIdentityKeys({
      player: row?.data || {},
      playerDocumentId,
    }).forEach(identityKey => {
      const ids = idsByIdentityKey.get(identityKey) || new Set()
      ids.add(playerDocumentId)
      idsByIdentityKey.set(identityKey, ids)
    })
  })

  return idsByIdentityKey
}

const TARGET_IDENTITY_PRIORITY = Object.freeze([
  'document',
  'external',
  'internal',
  'name',
])

const resolveTargetPlayerIdentity = ({
  player = {},
  targetIdentityIndex,
} = {}) => {
  if (!(targetIdentityIndex instanceof Map)) {
    const playerDocumentId = clean(player?.playerDocumentId) ||
      clean(buildPlayerDocumentId(player))

    return {
      playerDocumentId,
      ambiguousPlayerDocumentIds: [],
      matchedBy: playerDocumentId ? 'document' : '',
    }
  }

  const identityKeys = buildPlayerIdentityKeys({ player })

  for (const prefix of TARGET_IDENTITY_PRIORITY) {
    const matchedIds = new Set()

    identityKeys
      .filter(identityKey => identityKey.startsWith(`${prefix}:`))
      .forEach(identityKey => {
        const ids = targetIdentityIndex.get(identityKey)
        if (!(ids instanceof Set)) return

        ids.forEach(id => matchedIds.add(id))
      })

    if (matchedIds.size === 1) {
      return {
        playerDocumentId: [...matchedIds][0],
        ambiguousPlayerDocumentIds: [],
        matchedBy: prefix,
      }
    }

    if (matchedIds.size > 1) {
      return {
        playerDocumentId: '',
        ambiguousPlayerDocumentIds: [...matchedIds],
        matchedBy: prefix,
      }
    }
  }

  return {
    playerDocumentId: '',
    ambiguousPlayerDocumentIds: [],
    matchedBy: '',
  }
}

const buildTeamTruthEligibilityByPlayerDocumentId = ({
  teamSnapshot,
  playerRows = [],
} = {}) => {
  const eligibilityById = new Map()
  const targetIdentityIndex = buildTargetIdentityIndex(playerRows)

  const mergeEligibility = ({ playerDocumentId, player }) => {
    if (!playerDocumentId) return

    const reasons = resolvePlayerTrackingReasons(player)
    const current = eligibilityById.get(playerDocumentId) || {
      professionalProfile: false,
      realTransfer: false,
      identityAmbiguous: false,
      eligible: false,
    }
    const professionalProfile = reasons.includes(
      SCOUTING_PLAYER_TRACKING_REASONS.PROFILE
    )
    const realTransfer = hasRealPlayerTransfer(player)

    eligibilityById.set(playerDocumentId, {
      professionalProfile:
        current.professionalProfile || professionalProfile,
      realTransfer: current.realTransfer || realTransfer,
      identityAmbiguous: current.identityAmbiguous || false,
      eligible:
        current.eligible || professionalProfile || realTransfer,
    })
  }

  const blockAmbiguousTargets = playerDocumentIds => {
    unique(playerDocumentIds).forEach(playerDocumentId => {
      const current = eligibilityById.get(playerDocumentId) || {
        professionalProfile: false,
        realTransfer: false,
        identityAmbiguous: false,
        eligible: false,
      }

      eligibilityById.set(playerDocumentId, {
        ...current,
        identityAmbiguous: true,
        eligible: true,
      })
    })
  }

  ;(teamSnapshot?.docs || []).forEach(snapshotDoc => {
    const teamDocument = snapshotDoc.data() || {}

    ;['current', 'history'].forEach(container => {
      const seasonRows = Array.isArray(teamDocument?.[container])
        ? teamDocument[container]
        : []

      seasonRows.forEach(seasonRow => {
        const teamPlayers = Array.isArray(seasonRow?.teamPlayers)
          ? seasonRow.teamPlayers
          : []

        teamPlayers.forEach(player => {
          const identityMatch = resolveTargetPlayerIdentity({
            player,
            targetIdentityIndex,
          })

          if (identityMatch.ambiguousPlayerDocumentIds.length) {
            blockAmbiguousTargets(
              identityMatch.ambiguousPlayerDocumentIds
            )
            return
          }

          mergeEligibility({
            playerDocumentId: identityMatch.playerDocumentId,
            player,
          })
        })
      })
    })
  })

  return eligibilityById
}

const buildAffectedTeamDocumentIdsFromTeamSnapshot = ({
  teamSnapshot,
  playerRows = [],
  candidateIds = [],
} = {}) => {
  const candidateSet = candidateIds instanceof Set
    ? candidateIds
    : new Set(unique(candidateIds))
  const targetIdentityIndex = buildTargetIdentityIndex(playerRows)
  const affectedTeamDocumentIds = new Set()

  ;(teamSnapshot?.docs || []).forEach(snapshotDoc => {
    const teamDocument = snapshotDoc.data() || {}
    let targetFound = false

    ;['current', 'history'].forEach(container => {
      if (targetFound) return

      const seasonRows = Array.isArray(teamDocument?.[container])
        ? teamDocument[container]
        : []

      seasonRows.forEach(seasonRow => {
        if (targetFound) return

        const teamPlayers = Array.isArray(seasonRow?.teamPlayers)
          ? seasonRow.teamPlayers
          : []

        teamPlayers.forEach(player => {
          if (targetFound) return

          const directPlayerDocumentId = clean(
            player?.playerDocumentId
          )

          if (
            directPlayerDocumentId &&
            candidateSet.has(directPlayerDocumentId)
          ) {
            targetFound = true
            return
          }

          const identityMatch = resolveTargetPlayerIdentity({
            player,
            targetIdentityIndex,
          })

          if (
            identityMatch.playerDocumentId &&
            candidateSet.has(identityMatch.playerDocumentId)
          ) {
            targetFound = true
            return
          }

          if (
            identityMatch.ambiguousPlayerDocumentIds
              .some(id => candidateSet.has(id))
          ) {
            targetFound = true
          }
        })
      })
    })

    if (targetFound) {
      affectedTeamDocumentIds.add(snapshotDoc.id)
    }
  })

  return [...affectedTeamDocumentIds]
}

const buildTeamCleanup = ({
  teamDocument,
  candidateIds,
} = {}) => {
  const candidateSet = candidateIds instanceof Set
    ? candidateIds
    : new Set(unique(candidateIds))

  const cleanSeasonRows = rows => {
    if (!Array.isArray(rows)) {
      return {
        changed: false,
        referencesCleared: 0,
        rows,
      }
    }

    let referencesCleared = 0
    let changed = false

    const nextRows = rows.map(seasonRow => {
      const teamPlayers = Array.isArray(seasonRow?.teamPlayers)
        ? seasonRow.teamPlayers
        : []
      let seasonChanged = false

      const nextPlayers = teamPlayers.map(player => {
        const playerDocumentId = clean(player?.playerDocumentId)

        if (!playerDocumentId || !candidateSet.has(playerDocumentId)) {
          return player
        }

        const {
          playerDocumentId: removedPlayerDocumentId,
          ...nextPlayer
        } = player

        void removedPlayerDocumentId
        seasonChanged = true
        changed = true
        referencesCleared += 1

        return nextPlayer
      })

      return seasonChanged
        ? {
            ...seasonRow,
            teamPlayers: nextPlayers,
          }
        : seasonRow
    })

    return {
      changed,
      referencesCleared,
      rows: nextRows,
    }
  }

  const currentCleanup = cleanSeasonRows(teamDocument?.current)
  const historyCleanup = cleanSeasonRows(teamDocument?.history)
  const patch = {}

  if (currentCleanup.changed) patch.current = currentCleanup.rows
  if (historyCleanup.changed) patch.history = historyCleanup.rows

  return {
    changed: currentCleanup.changed || historyCleanup.changed,
    referencesCleared:
      currentCleanup.referencesCleared +
      historyCleanup.referencesCleared,
    patch,
  }
}

export const createPlayerDocumentCleanupMigration = ({
  action,
  label,
  isCandidate,
  requiresTeamTruth = false,
  preDeleteTeamTruthScope = 'global',
  allowLegacyTeamScopeRecoveryFromTeams = false,
} = {}) => {
  const cleanupAction = clean(action)
  const cleanupLabel = clean(label) || 'Player document cleanup'

  if (!cleanupAction || typeof isCandidate !== 'function') {
    throw new Error(
      'Player document cleanup migration requires action and isCandidate'
    )
  }

  const readMeta = Object.freeze({
    feature: 'playersDatabase',
    action: cleanupAction,
    operationSubtype: 'maintenance-read',
    meta: { source: 'server' },
  })
  const writeMeta = Object.freeze({
    feature: 'playersDatabase',
    action: cleanupAction,
    operationSubtype: 'maintenance-batch',
  })

  const normalizeFirestoreErrorCode = error => clean(
    error?.code || error?.name
  ).toLowerCase()

  const isTransientFirestoreError = error => {
    const code = normalizeFirestoreErrorCode(error)
    const message = clean(error?.message).toLowerCase()

    return (
      code.includes('unavailable') ||
      code.includes('deadline-exceeded') ||
      code.includes('resource-exhausted') ||
      code.includes('aborted') ||
      message.includes('failed to get documents from server') ||
      message.includes('write stream exhausted') ||
      message.includes('maximum backoff delay')
    )
  }

  const withFirestoreTransientRetry = async ({
    operation,
    operationLabel,
  } = {}) => {
    if (typeof operation !== 'function') {
      throw new Error(`${cleanupLabel} retry stopped: operation is required`)
    }

    let lastError = null

    for (
      let attempt = 1;
      attempt <= TRANSIENT_RETRY_MAX_ATTEMPTS;
      attempt += 1
    ) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (
          !isTransientFirestoreError(error) ||
          attempt >= TRANSIENT_RETRY_MAX_ATTEMPTS
        ) {
          throw error
        }

        const configuredDelay = Number(
          TRANSIENT_RETRY_DELAYS_MS[attempt - 1] || 0
        )
        const jitter = Math.floor(Math.random() * 500)
        const delayMs = configuredDelay + jitter

        console.warn(
          `[playersDatabase] ${cleanupLabel} transient retry:`,
          {
            label: clean(operationLabel) || 'firestore-operation',
            attempt,
            maxAttempts: TRANSIENT_RETRY_MAX_ATTEMPTS,
            delayMs,
            code: normalizeFirestoreErrorCode(error),
          }
        )

        await sleep(delayMs)
      }
    }

    throw lastError
  }

  const buildTargetFingerprint = playerDocumentIds => (
    JSON.stringify(unique(playerDocumentIds).sort())
  )

  const buildTeamDocumentIdsFingerprint = teamDocumentIds => (
    JSON.stringify(unique(teamDocumentIds).sort())
  )

  const assertTeamDocumentIdsFingerprint = ({
    teamDocumentIds = [],
    teamDocumentIdsFingerprint = '',
  } = {}) => {
    const expectedFingerprint = clean(teamDocumentIdsFingerprint)
    const actualFingerprint = buildTeamDocumentIdsFingerprint(
      teamDocumentIds
    )

    if (!expectedFingerprint || expectedFingerprint !== actualFingerprint) {
      throw new Error(
        `${cleanupLabel} stopped: Team document fingerprint mismatch`
      )
    }

    return actualFingerprint
  }

  const attachResolvedTeamScopeToError = ({
    error,
    teamDocumentIds = [],
  } = {}) => {
    const resolvedIds = unique(teamDocumentIds)
    const resolvedFingerprint = buildTeamDocumentIdsFingerprint(
      resolvedIds
    )

    if (error && typeof error === 'object') {
      error.playerDocumentCleanupTeamScope = {
        teamDocumentIdsAffected: resolvedIds,
        teamDocumentIdsAffectedFingerprint: resolvedFingerprint,
      }

      return error
    }

    const wrappedError = new Error(
      clean(error) || `${cleanupLabel} player delete failed`
    )

    wrappedError.playerDocumentCleanupTeamScope = {
      teamDocumentIdsAffected: resolvedIds,
      teamDocumentIdsAffectedFingerprint: resolvedFingerprint,
    }

    return wrappedError
  }

  const assertTargetFingerprint = ({
    playerDocumentIds,
    targetFingerprint,
  } = {}) => {
    const expectedFingerprint = clean(targetFingerprint)
    const actualFingerprint = buildTargetFingerprint(playerDocumentIds)

    if (!expectedFingerprint || expectedFingerprint !== actualFingerprint) {
      throw new Error(`${cleanupLabel} stopped: target fingerprint mismatch`)
    }

    return actualFingerprint
  }

  const readCollection = collectionName => (
    withFirestoreTransientRetry({
      operationLabel: `read-collection:${clean(collectionName)}`,
      operation: () => trackedGetDocsFromServer(
        collection(db, collectionName),
        {
          ...readMeta,
          collection: collectionName,
        }
      ),
    })
  )

  const readPlayerDocumentsById = async playerDocumentIds => {
    const rows = []

    for (const idChunk of chunk(unique(playerDocumentIds), FIRESTORE_IN_LIMIT)) {
      const snapshot = await withFirestoreTransientRetry({
        operationLabel: 'read-player-documents-by-id',
        operation: () => trackedGetDocsFromServer(
          query(
            collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
            where(documentId(), 'in', idChunk)
          ),
          {
            ...readMeta,
            collection: PLAYERS_DATABASE_COLLECTIONS.players,
          }
        ),
      })

      snapshot.docs.forEach(snapshotDoc => {
        rows.push({
          id: snapshotDoc.id,
          data: snapshotDoc.data() || {},
          ref: snapshotDoc.ref,
        })
      })
    }

    return rows
  }

  const buildTeamDocumentIdsFromPlayerRows = playerRows => {
    const teamDocumentIds = []

    const addTeamIdentity = ({
      team = {},
      fallback = {},
    } = {}) => {
      const identity = normalizeTeamIdentity({
        team,
        fallback,
      })

      teamDocumentIds.push(
        identity?.birthTeamDocumentId,
        identity?.teamDocumentId
      )
    }

    ;(Array.isArray(playerRows) ? playerRows : []).forEach(row => {
      const player = row?.data || {}
      const seasonRows = [
        ...(Array.isArray(player?.current) ? player.current : []),
        ...(Array.isArray(player?.history) ? player.history : []),
      ]

      seasonRows.forEach(seasonRow => {
        addTeamIdentity({
          team: seasonRow?.team || seasonRow,
          fallback: seasonRow,
        })
      })

      ;(Array.isArray(player?.events) ? player.events : [])
        .forEach(event => {
          addTeamIdentity({
            team: event?.team || event,
            fallback: event,
          })
          addTeamIdentity({
            team: event?.fromTeam || {},
            fallback: {
              teamDocumentId:
                event?.fromBirthTeamDocumentId,
              birthTeamDocumentId:
                event?.fromBirthTeamDocumentId,
              teamId: event?.fromTeamId,
              birthTeamId: event?.fromBirthTeamId,
            },
          })
          addTeamIdentity({
            team: event?.toTeam || {},
            fallback: {
              teamDocumentId:
                event?.toBirthTeamDocumentId,
              birthTeamDocumentId:
                event?.toBirthTeamDocumentId,
              teamId: event?.toTeamId,
              birthTeamId: event?.toBirthTeamId,
            },
          })
        })
    })

    return unique(teamDocumentIds)
  }

  const readTeamDocumentsById = async teamDocumentIds => {
    const docs = []

    for (const idChunk of chunk(unique(teamDocumentIds), FIRESTORE_IN_LIMIT)) {
      const snapshot = await withFirestoreTransientRetry({
        operationLabel: 'read-team-documents-by-id',
        operation: () => trackedGetDocsFromServer(
          query(
            collection(db, PLAYERS_DATABASE_COLLECTIONS.teams),
            where(documentId(), 'in', idChunk)
          ),
          {
            ...readMeta,
            collection: PLAYERS_DATABASE_COLLECTIONS.teams,
          }
        ),
      })

      snapshot.docs.forEach(snapshotDoc => {
        docs.push(snapshotDoc)
      })
    }

    return {
      docs,
      empty: docs.length === 0,
    }
  }

  const readSearchIndexesForPlayerDocuments = async playerDocumentIds => {
    const byIndexId = new Map()

    for (const idChunk of chunk(unique(playerDocumentIds), FIRESTORE_IN_LIMIT)) {
      const sourceSnapshot = await withFirestoreTransientRetry({
        operationLabel: 'read-search-index-source-document-refs',
        operation: () => trackedGetDocsFromServer(
          query(
            collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
            where('sourceCollection', '==', 'players'),
            where('sourceDocumentId', 'in', idChunk)
          ),
          {
            ...readMeta,
            collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
          }
        ),
      })

      sourceSnapshot.docs.forEach(snapshotDoc => {
        byIndexId.set(snapshotDoc.id, snapshotDoc)
      })

      const playerDocumentSnapshot = await withFirestoreTransientRetry({
        operationLabel: 'read-search-index-player-document-refs',
        operation: () => trackedGetDocsFromServer(
          query(
            collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
            where('playerDocumentId', 'in', idChunk)
          ),
          {
            ...readMeta,
            collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
          }
        ),
      })

      playerDocumentSnapshot.docs.forEach(snapshotDoc => {
        byIndexId.set(snapshotDoc.id, snapshotDoc)
      })
    }

    return [...byIndexId.values()]
  }

  const commitOperationChunk = async operationChunk => {
    const batch = createTrackedWriteBatch(db, {
      ...writeMeta,
      collection: 'multiple',
    })

    operationChunk.forEach(operation => {
      if (operation.type === 'delete') {
        batch.delete(operation.ref)
        return
      }

      batch.set(operation.ref, operation.data, { merge: true })
    })

    await batch.commit()
  }

  const commitOperations = async ({
    operations = [],
    batchSize = WRITE_BATCH_LIMIT,
  } = {}) => {
    let writes = 0

    for (const operationChunk of chunk(operations, batchSize)) {
      if (!operationChunk.length) continue

      await withFirestoreTransientRetry({
        operationLabel: 'write-batch-commit',
        operation: () => commitOperationChunk(operationChunk),
      })
      writes += operationChunk.length
    }

    return writes
  }

  const buildTeamTruth = ({
    teamSnapshot,
    playerRows = [],
  } = {}) => (
    requiresTeamTruth
      ? buildTeamTruthEligibilityByPlayerDocumentId({
          teamSnapshot,
          playerRows,
        })
      : new Map()
  )

  const playerIsCandidate = ({ id, data, teamTruth }) => (
    isCandidate({
      playerDocumentId: id,
      player: data,
      teamTruth: teamTruth.get(id) || null,
    }) === true
  )

  const revalidateCandidateIds = async ({
    playerDocumentIds = [],
    targetFingerprint = '',
    allowMissing = false,
    teamSnapshot = null,
  } = {}) => {
    const requestedIds = unique(playerDocumentIds)

    assertTargetFingerprint({
      playerDocumentIds: requestedIds,
      targetFingerprint,
    })

    const playerRows = await readPlayerDocumentsById(requestedIds)
    const resolvedTeamSnapshot = requiresTeamTruth
      ? teamSnapshot || await readCollection(PLAYERS_DATABASE_COLLECTIONS.teams)
      : teamSnapshot
    const teamTruth = buildTeamTruth({
      teamSnapshot: resolvedTeamSnapshot,
      playerRows,
    })
    const existingById = new Map(playerRows.map(row => [row.id, row]))
    const missingIds = requestedIds.filter(id => !existingById.has(id))
    const existingRows = requestedIds
      .map(id => existingById.get(id))
      .filter(Boolean)
    const rejectedRows = existingRows.filter(row => (
      !playerIsCandidate({
        id: row.id,
        data: row.data,
        teamTruth,
      })
    ))

    if (rejectedRows.length) {
      throw new Error(
        `${cleanupLabel} stopped: ${rejectedRows.length} existing ` +
        'player documents no longer satisfy the delete contract'
      )
    }

    if (missingIds.length && !allowMissing) {
      throw new Error(
        `${cleanupLabel} stopped: ${missingIds.length} target ` +
        'player documents are missing before this phase'
      )
    }

    return {
      playerRows: existingRows,
      playerDocumentIds: requestedIds,
      existingPlayerDocumentIds: existingRows.map(row => row.id),
      missingPlayerDocumentIds: missingIds,
      teamSnapshot: resolvedTeamSnapshot,
      teamTruth,
    }
  }

  const buildPreview = async () => {
    const playerSnapshot = await readCollection(
      PLAYERS_DATABASE_COLLECTIONS.players
    )

    if (!playerSnapshot || playerSnapshot.empty) {
      throw new Error(
        `${cleanupLabel} preview stopped: dbPlayers server snapshot is empty`
      )
    }

    const teamSnapshot = await readCollection(
      PLAYERS_DATABASE_COLLECTIONS.teams
    )

    if (!teamSnapshot || teamSnapshot.empty) {
      throw new Error(
        `${cleanupLabel} preview stopped: dbBirthTeams server snapshot is empty`
      )
    }

    const playerRows = playerSnapshot.docs.map(snapshotDoc => ({
      id: snapshotDoc.id,
      data: snapshotDoc.data() || {},
      ref: snapshotDoc.ref,
    }))
    const teamTruth = buildTeamTruth({
      teamSnapshot,
      playerRows,
    })
    const candidates = playerRows.filter(row => (
      playerIsCandidate({
        id: row.id,
        data: row.data,
        teamTruth,
      })
    ))
    const playerDocumentIds = candidates.map(row => row.id)
    const candidateIds = new Set(playerDocumentIds)
    let teamDocumentsAffected = 0
    let teamPlayerReferencesToClear = 0
    const teamDocumentIdsAffected = []

    teamSnapshot.docs.forEach(snapshotDoc => {
      const cleanup = buildTeamCleanup({
        teamDocument: snapshotDoc.data() || {},
        candidateIds,
      })

      if (!cleanup.changed) return
      teamDocumentsAffected += 1
      teamPlayerReferencesToClear += cleanup.referencesCleared
      teamDocumentIdsAffected.push(snapshotDoc.id)
    })

    const searchIndexDocs = await readSearchIndexesForPlayerDocuments(
      playerDocumentIds
    )

    return {
      mode: 'preview',
      source: 'server',
      playerDocumentsRead: playerRows.length,
      candidateCount: playerDocumentIds.length,
      playerDocumentIds,
      targetFingerprint: buildTargetFingerprint(playerDocumentIds),
      teamDocumentsRead: teamSnapshot.docs.length,
      teamDocumentsAffected,
      teamDocumentIdsAffected: unique(teamDocumentIdsAffected),
      teamDocumentIdsAffectedFingerprint:
        buildTeamDocumentIdsFingerprint(teamDocumentIdsAffected),
      teamPlayerReferencesToClear,
      searchIndexDocumentsToDelete: searchIndexDocs.length,
      expectedPlayerDocumentsAfterDelete:
        playerRows.length - playerDocumentIds.length,
    }
  }

  const applyTeamCleanup = async ({
    playerDocumentIds = [],
    targetFingerprint = '',
  } = {}) => {
    const teamSnapshot = await readCollection(
      PLAYERS_DATABASE_COLLECTIONS.teams
    )
    const validated = await revalidateCandidateIds({
      playerDocumentIds,
      targetFingerprint,
      teamSnapshot,
    })
    const candidateIds = new Set(validated.playerDocumentIds)
    const operations = []
    let referencesCleared = 0

    teamSnapshot.docs.forEach(snapshotDoc => {
      const cleanup = buildTeamCleanup({
        teamDocument: snapshotDoc.data() || {},
        candidateIds,
      })

      if (!cleanup.changed) return
      referencesCleared += cleanup.referencesCleared
      operations.push({
        type: 'set',
        ref: snapshotDoc.ref,
        data: cleanup.patch,
      })
    })

    const writes = await commitOperations({
      operations,
      batchSize: 1,
    })

    return {
      phase: 'teamCleanup',
      targetPlayerDocuments: validated.playerDocumentIds.length,
      teamDocumentsUpdated: writes,
      teamPlayerReferencesCleared: referencesCleared,
      writeCommitStrategy: 'one-team-document-per-commit',
    }
  }

  const applySearchIndexCleanup = async ({
    playerDocumentIds = [],
    targetFingerprint = '',
  } = {}) => {
    const validated = await revalidateCandidateIds({
      playerDocumentIds,
      targetFingerprint,
    })
    const searchIndexDocs = await readSearchIndexesForPlayerDocuments(
      validated.playerDocumentIds
    )
    const operations = searchIndexDocs.map(snapshotDoc => ({
      type: 'delete',
      ref: snapshotDoc.ref,
    }))
    const writes = await commitOperations({ operations })

    return {
      phase: 'searchIndexCleanup',
      targetPlayerDocuments: validated.playerDocumentIds.length,
      searchIndexDocumentsDeleted: writes,
    }
  }

  const applyPlayerDocumentDelete = async ({
    playerDocumentIds = [],
    targetFingerprint = '',
    teamDocumentIdsAffected = [],
    teamDocumentIdsAffectedFingerprint = '',
    expectedTeamDocumentsAffected = null,
    legacyTeamScopeRecoveryFromTeamsConfirmed = false,
    exclusiveDbBirthTeamsWriteWindowConfirmed = false,
  } = {}) => {
    let teamSnapshot = null
    let resolvedTeamDocumentIdsForResult = []

    if (
      requiresTeamTruth &&
      preDeleteTeamTruthScope === 'affectedTeamDocuments'
    ) {
      if (exclusiveDbBirthTeamsWriteWindowConfirmed !== true) {
        throw new Error(
          `${cleanupLabel} stopped: exclusive dbBirthTeams write window was not confirmed`
        )
      }

      let resolvedTeamDocumentIds = unique(
        teamDocumentIdsAffected
      )

      if (
        resolvedTeamDocumentIds.length &&
        clean(teamDocumentIdsAffectedFingerprint)
      ) {
        assertTeamDocumentIdsFingerprint({
          teamDocumentIds: resolvedTeamDocumentIds,
          teamDocumentIdsFingerprint:
            teamDocumentIdsAffectedFingerprint,
        })
      } else {
        const expectedTeamCount = Number(
          expectedTeamDocumentsAffected
        )

        if (
          !allowLegacyTeamScopeRecoveryFromTeams ||
          legacyTeamScopeRecoveryFromTeamsConfirmed !== true ||
          !expectedTeamCount
        ) {
          throw new Error(
            `${cleanupLabel} stopped: locked Team scope is required before player delete`
          )
        }

        const targetPlayerRows = await readPlayerDocumentsById(
          playerDocumentIds
        )
        const recoveryTeamSnapshot = await readCollection(
          PLAYERS_DATABASE_COLLECTIONS.teams
        )

        resolvedTeamDocumentIds =
          buildAffectedTeamDocumentIdsFromTeamSnapshot({
            teamSnapshot: recoveryTeamSnapshot,
            playerRows: targetPlayerRows,
            candidateIds: playerDocumentIds,
          })

        if (
          resolvedTeamDocumentIds.length !== expectedTeamCount
        ) {
          throw new Error(
            `${cleanupLabel} stopped: legacy Team scope recovery did not match the expected Team document count`
          )
        }
      }

      resolvedTeamDocumentIdsForResult = resolvedTeamDocumentIds

      try {
        teamSnapshot = await readTeamDocumentsById(
          resolvedTeamDocumentIds
        )

        if (
          teamSnapshot.docs.length !==
          resolvedTeamDocumentIds.length
        ) {
          throw new Error(
            `${cleanupLabel} stopped: one or more affected Team documents are missing`
          )
        }
      } catch (error) {
        throw attachResolvedTeamScopeToError({
          error,
          teamDocumentIds: resolvedTeamDocumentIdsForResult,
        })
      }
    } else {
      teamSnapshot = await readCollection(
        PLAYERS_DATABASE_COLLECTIONS.teams
      )
    }

    try {
      const validated = await revalidateCandidateIds({
        playerDocumentIds,
        targetFingerprint,
        allowMissing: true,
        teamSnapshot,
      })
      const candidateSet = new Set(validated.playerDocumentIds)
      let remainingTeamReferences = 0

      teamSnapshot.docs.forEach(snapshotDoc => {
        const cleanup = buildTeamCleanup({
          teamDocument: snapshotDoc.data() || {},
          candidateIds: candidateSet,
        })
        remainingTeamReferences += cleanup.referencesCleared
      })

      const remainingSearchIndexes =
        await readSearchIndexesForPlayerDocuments(
          validated.playerDocumentIds
        )

      if (remainingTeamReferences || remainingSearchIndexes.length) {
        throw new Error(
          `${cleanupLabel} stopped before player delete: ` +
          `${remainingTeamReferences} Team references and ` +
          `${remainingSearchIndexes.length} SearchIndex references remain`
        )
      }

      if (requiresTeamTruth) {
        const newlyEligibleIds = validated.playerDocumentIds.filter(id => (
          validated.teamTruth.get(id)?.eligible === true
        ))

        if (newlyEligibleIds.length) {
          throw new Error(
            `${cleanupLabel} stopped before player delete: ` +
            `${newlyEligibleIds.length} targets are eligible in Team truth`
          )
        }
      }

      const operations = validated.playerRows.map(row => ({
        type: 'delete',
        ref: row.ref,
      }))

      const writes = await commitOperations({ operations })

      return {
        phase: 'playerDelete',
        targetPlayerDocuments: validated.playerDocumentIds.length,
        alreadyDeletedPlayerDocuments:
          validated.missingPlayerDocumentIds.length,
        playerDocumentsDeleted: writes,
        teamDocumentIdsAffected:
          resolvedTeamDocumentIdsForResult,
        teamDocumentIdsAffectedFingerprint:
          buildTeamDocumentIdsFingerprint(
            resolvedTeamDocumentIdsForResult
          ),
      }
    } catch (error) {
      if (resolvedTeamDocumentIdsForResult.length) {
        throw attachResolvedTeamScopeToError({
          error,
          teamDocumentIds: resolvedTeamDocumentIdsForResult,
        })
      }

      throw error
    }
  }

  const verifyCleanup = async ({
    playerDocumentIds = [],
    targetFingerprint = '',
    teamDocumentIdsAffected = [],
    teamDocumentIdsAffectedFingerprint = '',
    expectedTeamDocumentsAffected = null,
    exclusiveDbBirthTeamsWriteWindowConfirmed = false,
  } = {}) => {
    const ids = unique(playerDocumentIds)

    assertTargetFingerprint({
      playerDocumentIds: ids,
      targetFingerprint,
    })

    const remainingPlayers = await readPlayerDocumentsById(ids)
    let teamSnapshot = null

    if (
      requiresTeamTruth &&
      preDeleteTeamTruthScope === 'affectedTeamDocuments'
    ) {
      if (exclusiveDbBirthTeamsWriteWindowConfirmed !== true) {
        throw new Error(
          `${cleanupLabel} verification stopped: exclusive dbBirthTeams write window was not confirmed`
        )
      }

      let resolvedTeamDocumentIds = unique(
        teamDocumentIdsAffected
      )

      if (
        resolvedTeamDocumentIds.length &&
        clean(teamDocumentIdsAffectedFingerprint)
      ) {
        assertTeamDocumentIdsFingerprint({
          teamDocumentIds: resolvedTeamDocumentIds,
          teamDocumentIdsFingerprint:
            teamDocumentIdsAffectedFingerprint,
        })
      } else {
        throw new Error(
          `${cleanupLabel} verification stopped: locked Team scope is required`
        )
      }

      teamSnapshot = await readTeamDocumentsById(
        resolvedTeamDocumentIds
      )

      if (
        teamSnapshot.docs.length !==
        resolvedTeamDocumentIds.length
      ) {
        throw new Error(
          `${cleanupLabel} verification stopped: one or more affected Team documents are missing`
        )
      }
    } else {
      teamSnapshot = await readCollection(
        PLAYERS_DATABASE_COLLECTIONS.teams
      )
    }

    let remainingTeamReferences = 0

    teamSnapshot.docs.forEach(snapshotDoc => {
      const cleanup = buildTeamCleanup({
        teamDocument: snapshotDoc.data() || {},
        candidateIds: new Set(ids),
      })
      remainingTeamReferences += cleanup.referencesCleared
    })

    const remainingSearchIndexes = await readSearchIndexesForPlayerDocuments(ids)

    return {
      mode: 'verification',
      targetFingerprint: buildTargetFingerprint(ids),
      targetPlayerDocuments: ids.length,
      remainingTargetPlayerDocuments: remainingPlayers.length,
      remainingTeamPlayerReferences: remainingTeamReferences,
      remainingSearchIndexDocuments: remainingSearchIndexes.length,
      complete:
        remainingPlayers.length === 0 &&
        remainingTeamReferences === 0 &&
        remainingSearchIndexes.length === 0,
    }
  }

  return Object.freeze({
    buildPreview,
    applyTeamCleanup,
    applySearchIndexCleanup,
    applyPlayerDocumentDelete,
    verifyCleanup,
  })
}
