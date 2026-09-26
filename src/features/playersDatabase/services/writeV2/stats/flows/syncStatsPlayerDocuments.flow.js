// src/features/playersDatabase/services/writeV2/stats/flows/syncStatsPlayerDocuments.flow.js

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { APPROVED_STATS_STATE_VERSION } from '../../../../domain/statsV2/approvedStatsState.builder.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const PLAYER_DOCUMENT_STATS_OWNED_ROOT_FIELDS = new Set([
  'current',
  'history',
])

const PLAYER_DOCUMENT_CREATE_IDENTITY_FIELDS = new Set([
  'id',
  'externalPlayerId',
  'fullName',
  'normalizedName',
  'birthYear',
  'birthDate',
  'status',
  'primaryPosition',
  'positionLayer',
  'numShirt',
])

const PLAYER_DOCUMENT_STATS_OWNED_SEASON_FIELDS = new Set([
  'seasonId',
  'seasonKey',
  'seasonStatus',
  'leagueId',
  'leagueName',
  'ageGroupId',
  'ageGroupLabel',
  'clubId',
  'clubName',
  'clubLevel',
  'clubStrengthLevel',
  'leagueLevel',
  'expectedLevelDelta',
  'teamName',
  'birthTeamId',
  'birthTeamDocumentId',
  'birthTeamSlot',
  'teamId',
  'birthYear',
  'primaryPosition',
  'positionLayer',
  'lineClassification',
  'numShirt',
  'rosterStatus',
  'isYoungerAgeGroup',
  'statsStatus',
  'playerStats',
  'scoutProfiles',
  'scoutCombinationIds',
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutPlayerInterest',
  'scoutEngineVersion',
  'updatedAt',
])

const requireApprovedState = approvedState => {
  if (!approvedState || typeof approvedState !== 'object' ||
      clean(approvedState.planType) !== 'approvedStatsState' ||
      Number(approvedState.planVersion) !== APPROVED_STATS_STATE_VERSION) {
    const error = new Error('Unsupported Approved Stats State contract')
    error.code = 'STATS_APPROVED_STATE_INVALID'
    throw error
  }

  return approvedState
}

const sameValue = (left, right) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const rejectForbiddenPatch = ({ patch, action, playerDocumentId }) => {
  const allowedRootFields = action === 'create'
    ? new Set([...PLAYER_DOCUMENT_STATS_OWNED_ROOT_FIELDS, ...PLAYER_DOCUMENT_CREATE_IDENTITY_FIELDS])
    : PLAYER_DOCUMENT_STATS_OWNED_ROOT_FIELDS
  const forbidden = Object.keys(patch).filter(key => !allowedRootFields.has(key))

  if (forbidden.length > 0) {
    const error = new Error(`Player Document patch contains fields outside Stats ownership: ${forbidden.join(', ')}`)
    error.code = 'STATS_PLAYER_DOCUMENT_PATCH_SCOPE_INVALID'
    error.playerDocumentId = playerDocumentId
    error.fields = forbidden
    throw error
  }
}

const sanitizeSeasonRow = ({ row, playerDocumentId }) => {
  if (!row || typeof row !== 'object' || Array.isArray(row) || !clean(row.seasonKey)) {
    const error = new Error(`Player Document season patch is invalid: ${playerDocumentId}`)
    error.code = 'STATS_PLAYER_DOCUMENT_PATCH_SCOPE_INVALID'
    throw error
  }

  const forbidden = Object.keys(row).filter(key => !PLAYER_DOCUMENT_STATS_OWNED_SEASON_FIELDS.has(key))
  if (forbidden.length > 0) {
    const error = new Error(`Player Document season patch contains fields outside Stats ownership: ${forbidden.join(', ')}`)
    error.code = 'STATS_PLAYER_DOCUMENT_PATCH_SCOPE_INVALID'
    error.playerDocumentId = playerDocumentId
    error.fields = forbidden
    throw error
  }

  return { ...row }
}

const mergeSeasonRows = ({ currentRows, approvedRows, playerDocumentId }) => {
  const next = Array.isArray(currentRows) ? currentRows.map(row => ({ ...row })) : []

  ;(Array.isArray(approvedRows) ? approvedRows : []).forEach(sourceRow => {
    const approvedRow = sanitizeSeasonRow({ row: sourceRow, playerDocumentId })
    const seasonKey = clean(approvedRow.seasonKey)
    const index = next.findIndex(row => clean(row?.seasonKey) === seasonKey)

    if (index >= 0) {
      next[index] = {
        ...next[index],
        ...approvedRow,
      }
    } else {
      next.push(approvedRow)
    }
  })

  return next
}

const buildOwnedDocumentState = ({ current, ownedPatch, action, playerDocumentId }) => {
  rejectForbiddenPatch({ patch: ownedPatch, action, playerDocumentId })

  const next = action === 'create'
    ? Object.fromEntries(
        Object.entries(ownedPatch).filter(([key]) => PLAYER_DOCUMENT_CREATE_IDENTITY_FIELDS.has(key))
      )
    : {}

  if (Object.prototype.hasOwnProperty.call(ownedPatch, 'current')) {
    next.current = mergeSeasonRows({
      currentRows: current?.current,
      approvedRows: ownedPatch.current,
      playerDocumentId,
    })
  }

  if (Object.prototype.hasOwnProperty.call(ownedPatch, 'history')) {
    next.history = mergeSeasonRows({
      currentRows: current?.history,
      approvedRows: ownedPatch.history,
      playerDocumentId,
    })
  }

  return next
}

const sameOwnedValues = (current, nextOwnedState) => (
  Object.entries(nextOwnedState).every(([key, value]) => sameValue(current?.[key], value))
)

export async function syncStatsPlayerDocumentsV2({ approvedState } = {}) {
  const approved = requireApprovedState(approvedState)
  const plans = Array.isArray(approved.playerDocumentPlans)
    ? approved.playerDocumentPlans
    : []
  const prepared = []

  for (const plan of plans) {
    const action = clean(plan?.action)
    const playerDocumentId = clean(plan?.playerDocumentId)

    if (!['create', 'update', 'retain'].includes(action) || !playerDocumentId) {
      const error = new Error('Approved Player Document plan is invalid')
      error.code = action === 'delete'
        ? 'STATS_PLAYER_DOCUMENT_DELETE_FORBIDDEN'
        : 'STATS_PLAYER_DOCUMENT_PLAN_INVALID'
      throw error
    }

    const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.players, playerDocumentId)
    const snapshot = await getDoc(ref)
    const exists = snapshot.exists()

    if ((action === 'update' || action === 'retain') && !exists) {
      const error = new Error(`Player Document does not exist: ${playerDocumentId}`)
      error.code = 'STATS_PLAYER_DOCUMENT_NOT_FOUND'
      throw error
    }

    const ownedPatch = action === 'retain' ? null : plan.ownedPatch
    if (action !== 'retain' && (!ownedPatch || typeof ownedPatch !== 'object' || Array.isArray(ownedPatch))) {
      const error = new Error(`Player Document owned patch is missing: ${playerDocumentId}`)
      error.code = 'STATS_PLAYER_DOCUMENT_PATCH_REQUIRED'
      throw error
    }

    const current = exists ? (snapshot.data() || {}) : {}
    const nextOwnedState = action === 'retain'
      ? null
      : buildOwnedDocumentState({ current, ownedPatch, action, playerDocumentId })

    if (action === 'create' && exists && !sameOwnedValues(current, nextOwnedState)) {
      const error = new Error(`Player Document already exists with different approved state: ${playerDocumentId}`)
      error.code = 'STATS_PLAYER_DOCUMENT_ALREADY_EXISTS'
      throw error
    }

    prepared.push({
      action,
      playerDocumentId,
      ref,
      current,
      nextOwnedState,
      exists,
    })
  }

  const results = []

  for (const item of prepared) {
    if (item.action === 'retain') {
      results.push({
        playerDocumentId: item.playerDocumentId,
        action: item.action,
        status: 'retained',
        writeSkipped: true,
      })
      continue
    }

    const unchanged = item.exists && sameOwnedValues(item.current, item.nextOwnedState)

    if (!unchanged) {
      await setDoc(item.ref, {
        ...item.nextOwnedState,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }

    results.push({
      playerDocumentId: item.playerDocumentId,
      action: item.action,
      status: unchanged ? 'unchanged' : item.action === 'create' ? 'created' : 'updated',
      writeSkipped: unchanged,
    })
  }

  return {
    createdCount: results.filter(result => result.status === 'created').length,
    updatedCount: results.filter(result => result.status === 'updated').length,
    retainedCount: results.filter(result => result.status === 'retained').length,
    results,
  }
}
