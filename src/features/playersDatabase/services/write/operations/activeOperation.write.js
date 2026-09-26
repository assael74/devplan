// src/features/playersDatabase/services/write/operations/activeOperation.write.js

import {
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

export const ACTIVE_OPERATION_DOCUMENT_ID = 'active'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const activeOperationRef = () => (
  doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.operations,
    ACTIVE_OPERATION_DOCUMENT_ID
  )
)

export const buildActiveOperationDocument = ({
  job = {},
  status = 'queued',
} = {}) => {
  // buildQueuedPlayersDatabaseJob returns { id, ref, document }.
  // The actual durable Job fields are therefore under job.document.
  const jobDocument = job?.document || job || {}

  return {
    id: ACTIVE_OPERATION_DOCUMENT_ID,
    jobId: clean(job.id || job.jobId || jobDocument.id || jobDocument.jobId),
    jobType: clean(jobDocument.type),
    status: clean(status) || 'queued',

    scope: {
      leagueId: clean(jobDocument?.scope?.leagueId),
      seasonKey: clean(jobDocument?.scope?.seasonKey),
      teamSeasonDocumentId: clean(jobDocument?.scope?.teamSeasonDocumentId),
    },

    sourceGeneration: clean(jobDocument.sourceGeneration),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}


export async function assertNoActiveOperation() {
  const snapshot = await getDoc(activeOperationRef())
  if (!snapshot.exists()) return null

  const current = snapshot.data() || {}
  const error = new Error(
    'המערכת עסוקה בסנכרון פעולה קודמת. יש להמתין לסיום הסנכרון או לבצע Recovery.'
  )

  error.code = 'PLAYERS_DATABASE_OPERATION_ACTIVE'
  error.activeOperation = {
    jobId: clean(current.jobId),
    jobType: clean(current.jobType),
    status: clean(current.status),
  }

  throw error
}

export async function assertActiveOperationAvailable({
  transaction,
  jobId = '',
} = {}) {
  if (!transaction) {
    throw new Error('Missing transaction for active-operation check')
  }

  const snapshot = await transaction.get(activeOperationRef())
  if (!snapshot.exists()) return null

  const current = snapshot.data() || {}
  const currentJobId = clean(current.jobId)
  const requestedJobId = clean(jobId)

  // Allows the same transaction to be retried safely.
  if (currentJobId && currentJobId === requestedJobId) {
    return current
  }

  throw new Error(
    `A major operation is already active: ${currentJobId || 'unknown job'}`
  )
}

export function createActiveOperation({
  transaction,
  job = {},
} = {}) {
  if (!transaction) {
    throw new Error('Missing transaction for active-operation creation')
  }

  const jobDocument = job?.document || job || {}
  const jobId = clean(job.id || job.jobId || jobDocument.id || jobDocument.jobId)

  if (!jobId) {
    throw new Error('Missing job id for active-operation creation')
  }

  transaction.set(
    activeOperationRef(),
    buildActiveOperationDocument({ job }),
  )
}

export async function assertActiveOperationOwner({
  transaction,
  jobId = '',
} = {}) {
  if (!transaction) {
    throw new Error('Missing transaction for active-operation ownership check')
  }

  const resolvedJobId = clean(jobId)
  if (!resolvedJobId) {
    throw new Error('Missing job id for active-operation ownership check')
  }

  const snapshot = await transaction.get(activeOperationRef())
  if (!snapshot.exists()) {
    throw new Error('Active operation is missing')
  }

  const current = snapshot.data() || {}

  if (clean(current.jobId) !== resolvedJobId) {
    throw new Error('Active operation belongs to another job')
  }

  return current
}

export async function releaseActiveOperation({
  transaction,
  jobId = '',
} = {}) {
  await assertActiveOperationOwner({ transaction, jobId })
  transaction.delete(activeOperationRef())
}
