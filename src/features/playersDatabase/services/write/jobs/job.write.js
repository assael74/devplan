// src/features/playersDatabase/services/write/jobs/job.write.js

import {
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const JOB_TYPES = new Set([
  'league',
  'roster',
  'stats',
])

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const normalizeScope = (scope = {}) => ({
  leagueId: clean(scope.leagueId),
  seasonId: clean(scope.seasonId),
  seasonKey: clean(scope.seasonKey),
  teamId: clean(scope.teamId),
  teamSeasonDocumentId: clean(scope.teamSeasonDocumentId),
})

export const playersDatabaseJobRef = jobId => (
  doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.jobs,
    clean(jobId)
  )
)

export const playersDatabaseJobActionsRef = jobId => (
  collection(
    playersDatabaseJobRef(jobId),
    PLAYERS_DATABASE_COLLECTIONS.jobActions
  )
)

export const playersDatabaseJobActionRef = ({
  jobId = '',
  actionId = '',
} = {}) => (
  doc(
    playersDatabaseJobActionsRef(jobId),
    clean(actionId)
  )
)

export const createPlayersDatabaseJobId = () => (
  doc(collection(db, PLAYERS_DATABASE_COLLECTIONS.jobs)).id
)

export const createPlayersDatabaseJobActionId = jobId => (
  doc(playersDatabaseJobActionsRef(jobId)).id
)

export function buildQueuedPlayersDatabaseJob({
  id = '',
  type = '',
  scope = {},
  sourceGeneration = '',
  approvedPlan = {},
  actionCount = 0,
} = {}) {
  const jobId = clean(id) || createPlayersDatabaseJobId()
  const jobType = clean(type)
  const generation = clean(sourceGeneration)

  if (!JOB_TYPES.has(jobType)) {
    throw new Error(`Unsupported players database job type: ${jobType}`)
  }

  if (!generation) {
    throw new Error('Missing canonical generation for players database job')
  }

  const normalizedActionCount = Number(actionCount || 0)

  return {
    id: jobId,
    ref: playersDatabaseJobRef(jobId),
    document: {
      id: jobId,
      jobId,
      type: jobType,
      status: 'queued',

      scope: normalizeScope(scope),

      sourceGeneration: generation,

      approvedPlan: {
        version: Number(approvedPlan.version || 1),
        fingerprint: clean(approvedPlan.fingerprint),
        actionCount: normalizedActionCount,
      },

      actionsSummary: {
        total: normalizedActionCount,
        pending: normalizedActionCount,
        completed: 0,
        failed: 0,
      },

      attempt: {
        token: null,
        leaseExpiresAt: null,
        count: 0,
        claimedAt: null,
      },

      verification: {
        status: 'pending',
        verifiedAt: null,
        error: null,
      },

      retryCount: 0,
      error: null,

      requestedAt: serverTimestamp(),
      startedAt: null,
      completedAt: null,
      failedAt: null,
      updatedAt: serverTimestamp(),
    },
  }
}

export function buildPlayersDatabaseJobAction({
  jobId = '',
  id = '',
  type = '',
  order = 0,
  target = {},
  sourceGeneration = '',
  approvedPayload = {},
  expectedTargetFingerprint = '',
} = {}) {
  const resolvedJobId = clean(jobId)
  const actionId = clean(id) || createPlayersDatabaseJobActionId(resolvedJobId)
  const generation = clean(sourceGeneration)

  if (!resolvedJobId) {
    throw new Error('Missing job id for job action')
  }

  if (!clean(type)) {
    throw new Error('Missing job action type')
  }

  if (!clean(target.collection) || !clean(target.documentId)) {
    throw new Error('Missing job action target')
  }

  if (!generation) {
    throw new Error('Missing job action source generation')
  }

  return {
    id: actionId,
    ref: playersDatabaseJobActionRef({
      jobId: resolvedJobId,
      actionId,
    }),
    document: {
      id: actionId,
      actionId,
      jobId: resolvedJobId,
      type: clean(type),
      order: Number(order || 0),

      target: {
        collection: clean(target.collection),
        documentId: clean(target.documentId),
      },

      sourceGeneration: generation,
      approvedPayload,
      expectedTargetFingerprint: clean(expectedTargetFingerprint),

      status: 'pending',

      receipt: {
        appliedAt: null,
        verifiedAt: null,
        outputFingerprint: '',
      },

      error: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  }
}

export function queuePlayersDatabaseJobInTransaction({
  transaction,
  job = {},
  actions = [],
} = {}) {
  if (!transaction) {
    throw new Error('Missing transaction for queued job creation')
  }

  if (!job?.ref || !job?.document) {
    throw new Error('Missing queued job')
  }

  const normalizedActions = Array.isArray(actions) ? actions : []

  if (
    Number(job.document?.approvedPlan?.actionCount || 0) !==
    normalizedActions.length
  ) {
    throw new Error('Queued job action count does not match its actions')
  }

  transaction.set(job.ref, job.document)

  normalizedActions.forEach(action => {
    if (!action?.ref || !action?.document) {
      throw new Error('Invalid queued job action')
    }

    transaction.set(action.ref, action.document)
  })
}
