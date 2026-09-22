// C:/projects/devplan/functions/src/services/playersDatabase/leagueProjectionJobs/leagueProjectionJob.repository.js

const { admin, db } = require('../../../config/admin')
const { randomUUID } = require('crypto')
const {
  LEAGUE_PROJECTION_JOB_STATUS,
} = require('../leagueProjectionJob.contract')

const JOB_COLLECTION = 'dbLeagueProjectionJobs'
const LEASE_DURATION_MS = 10 * 60 * 1000
const RECOVERY_BATCH_SIZE = 25

const jobRef = jobId => db.collection(JOB_COLLECTION).doc(jobId)

const hasCurrentAttempt = ({ job = {}, sourceRevision = '', attemptToken = '' } = {}) => (
  job.status === LEAGUE_PROJECTION_JOB_STATUS.PROCESSING &&
  String(job.sourceRevision || '') === String(sourceRevision || '') &&
  String(job.attemptToken || '') === String(attemptToken || '')
)

async function runForCurrentLeagueProjectionAttempt({
  jobId,
  sourceRevision,
  attemptToken,
  callback,
} = {}) {
  if (!jobId || !sourceRevision || !attemptToken) {
    throw new Error('Missing league projection job attempt identity')
  }

  return db.runTransaction(async transaction => {
    const reference = jobRef(jobId)
    const snapshot = await transaction.get(reference)
    const current = snapshot.exists ? snapshot.data() || {} : null
    if (!hasCurrentAttempt({ job: current, sourceRevision, attemptToken })) {
      return { applied: false, reason: 'staleAttempt' }
    }
    return callback({ transaction, reference, job: current })
  })
}

async function claimLeagueProjectionJob(jobId) {
  return db.runTransaction(async transaction => {
    const reference = jobRef(jobId)
    const snapshot = await transaction.get(reference)
    const current = snapshot.exists ? snapshot.data() || {} : null
    if (!current) return null

    const now = Date.now()
    const leaseExpiresAt = current.leaseExpiresAt?.toMillis?.() || 0
    const canClaim = (
      current.status === LEAGUE_PROJECTION_JOB_STATUS.QUEUED ||
      (current.status === LEAGUE_PROJECTION_JOB_STATUS.PROCESSING && leaseExpiresAt <= now)
    )
    if (!canClaim) return null

    // Legacy queued jobs predate sourceRevision. Give them a persisted
    // revision when first claimed so they receive the same ownership guard.
    const sourceRevision = String(current.sourceRevision || randomUUID())
    const attemptToken = randomUUID()

    transaction.update(reference, {
      status: LEAGUE_PROJECTION_JOB_STATUS.PROCESSING,
      attempts: Number(current.attempts || 0) + 1,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      leaseExpiresAt: admin.firestore.Timestamp.fromMillis(now + LEASE_DURATION_MS),
      attemptToken,
      sourceRevision,
      error: null,
    })

    return {
      id: jobId,
      ...current,
      attemptToken,
      sourceRevision,
    }
  })
}

async function failLeagueProjectionJob({ jobId, sourceRevision, attemptToken, error }) {
  return runForCurrentLeagueProjectionAttempt({
    jobId,
    sourceRevision,
    attemptToken,
    callback: ({ transaction, reference }) => {
      transaction.update(reference, {
        status: LEAGUE_PROJECTION_JOB_STATUS.FAILED,
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        leaseExpiresAt: null,
        error: {
          message: String(error?.message || 'League projection job failed'),
          code: String(error?.code || ''),
        },
      })
      return { applied: true }
    },
  })
}

async function updateLeagueProjectionJobStage({
  jobId,
  sourceRevision,
  attemptToken,
  stage = '',
  status = '',
  result = null,
} = {}) {
  if (!stage || !status) throw new Error('Missing league projection job stage state')

  return runForCurrentLeagueProjectionAttempt({
    jobId,
    sourceRevision,
    attemptToken,
    callback: ({ transaction, reference }) => {
      transaction.update(reference, {
        [`stages.${stage}`]: status,
        ...(result === null ? {} : { [`stageResults.${stage}`]: result }),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      return { applied: true }
    },
  })
}

async function completeLeagueProjectionJob({ jobId, sourceRevision, attemptToken }) {
  return runForCurrentLeagueProjectionAttempt({
    jobId,
    sourceRevision,
    attemptToken,
    callback: ({ transaction, reference }) => {
      transaction.update(reference, {
        status: LEAGUE_PROJECTION_JOB_STATUS.COMPLETED,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        leaseExpiresAt: null,
        error: null,
      })
      return { applied: true }
    },
  })
}

async function supersedeLeagueProjectionJob({ jobId, sourceRevision, attemptToken }) {
  return runForCurrentLeagueProjectionAttempt({
    jobId, sourceRevision, attemptToken,
    callback: ({ transaction, reference }) => {
      transaction.update(reference, {
        status: 'superseded', supersededAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null,
      })
      return { applied: true }
    },
  })
}

async function markLeagueProjectionJobPartial({ jobId }) {
  await jobRef(jobId).update({
    status: LEAGUE_PROJECTION_JOB_STATUS.PARTIAL,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    leaseExpiresAt: null,
  })
}

async function requeueExpiredLeagueProjectionJobs() {
  const expired = await db.collection(JOB_COLLECTION)
    .where('status', '==', LEAGUE_PROJECTION_JOB_STATUS.PROCESSING)
    .where('leaseExpiresAt', '<=', admin.firestore.Timestamp.now())
    .limit(RECOVERY_BATCH_SIZE)
    .get()

  await Promise.all(expired.docs.map(snapshot => db.runTransaction(async transaction => {
    const currentSnapshot = await transaction.get(snapshot.ref)
    const current = currentSnapshot.exists ? currentSnapshot.data() || {} : null
    const leaseExpiresAt = current?.leaseExpiresAt?.toMillis?.() || 0
    if (
      current?.status !== LEAGUE_PROJECTION_JOB_STATUS.PROCESSING ||
      leaseExpiresAt > Date.now()
    ) return false

    transaction.update(snapshot.ref, {
      status: LEAGUE_PROJECTION_JOB_STATUS.QUEUED,
      attemptToken: null,
      leaseExpiresAt: null,
      recoveryRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return true
  })))

  return { scannedCount: expired.size }
}

module.exports = {
  claimLeagueProjectionJob,
  completeLeagueProjectionJob,
  supersedeLeagueProjectionJob,
  failLeagueProjectionJob,
  hasCurrentAttempt,
  markLeagueProjectionJobPartial,
  requeueExpiredLeagueProjectionJobs,
  runForCurrentLeagueProjectionAttempt,
  updateLeagueProjectionJobStage,
}
