const { admin, db } = require('../../../config/admin')
const { randomUUID } = require('crypto')

const COLLECTION = 'dbTeamRosterProjectionJobs'
const LEASE_MS = 10 * 60 * 1000
const PREPARING_RECOVERY_GRACE_MS = 2 * 60 * 1000
const ref = id => db.collection(COLLECTION).doc(id)

const isCurrentAttempt = ({ job = {}, sourceRevision, attemptToken }) => (
  job.status === 'processing' &&
  String(job.sourceRevision || '') === String(sourceRevision || '') &&
  String(job.attemptToken || '') === String(attemptToken || '')
)

async function claimTeamRosterProjectionJob(jobId) {
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref(jobId))
    const job = snapshot.exists ? snapshot.data() || {} : null
    if (!job) return null
    const expired = (job.leaseExpiresAt?.toMillis?.() || 0) <= Date.now()
    if (job.status !== 'queued' && !(job.status === 'processing' && expired)) return null
    const sourceRevision = String(job.sourceRevision || randomUUID())
    const attemptToken = randomUUID()
    transaction.update(ref(jobId), {
      status: 'processing', sourceRevision, attemptToken,
      attempts: Number(job.attempts || 0) + 1,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      leaseExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + LEASE_MS), error: null,
    })
    return { id: jobId, ...job, sourceRevision, attemptToken }
  })
}

async function withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback }) {
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref(jobId))
    const job = snapshot.exists ? snapshot.data() || {} : null
    if (!isCurrentAttempt({ job, sourceRevision, attemptToken })) return { applied: false, reason: 'staleAttempt' }
    return callback({ transaction, reference: ref(jobId) })
  })
}

async function updateStage({ jobId, sourceRevision, attemptToken, stage, result }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      [`stages.${stage}`]: 'completed', [`stageResults.${stage}`]: result,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return { applied: true }
  } })
}

async function complete({ jobId, sourceRevision, attemptToken }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null, error: null,
    })
    return { applied: true }
  } })
}

async function supersede({ jobId, sourceRevision, attemptToken }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: 'superseded', supersededAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null,
    })
    return { applied: true }
  } })
}

async function fail({ jobId, sourceRevision, attemptToken, error }) {
  return withCurrentAttempt({ jobId, sourceRevision, attemptToken, callback: ({ transaction, reference }) => {
    transaction.update(reference, {
      status: 'failed', failedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), leaseExpiresAt: null,
      error: { message: String(error?.message || 'Team roster projection job failed'), code: String(error?.code || '') },
    })
    return { applied: true }
  } })
}

async function requeueExpiredTeamRosterProjectionJobs() {
  const now = Date.now()
  const [processingSnapshot, preparingSnapshot] = await Promise.all([
    db.collection(COLLECTION)
      .where('status', '==', 'processing')
      .where('leaseExpiresAt', '<=', admin.firestore.Timestamp.now())
      .limit(25)
      .get(),
    db.collection(COLLECTION)
      .where('status', '==', 'preparing')
      .limit(25)
      .get(),
  ])

  const candidates = [...processingSnapshot.docs, ...preparingSnapshot.docs]
  const recovered = await Promise.all(candidates.map(item => db.runTransaction(async transaction => {
    const current = await transaction.get(item.ref)
    const job = current.exists ? current.data() || {} : null
    if (!job) return false

    const processingExpired = (
      job.status === 'processing' &&
      (job.leaseExpiresAt?.toMillis?.() || 0) <= Date.now()
    )
    const preparingSince = job.updatedAt?.toMillis?.() || job.requestedAt?.toMillis?.() || 0
    const preparingAbandoned = (
      job.status === 'preparing' &&
      preparingSince > 0 &&
      preparingSince <= Date.now() - PREPARING_RECOVERY_GRACE_MS
    )

    if (!processingExpired && !preparingAbandoned) return false

    transaction.update(item.ref, {
      status: 'queued',
      attemptToken: null,
      leaseExpiresAt: null,
      recoveryRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return true
  })))

  return {
    scannedCount: candidates.length,
    recoveredCount: recovered.filter(Boolean).length,
    expiredProcessingCount: processingSnapshot.size,
    preparingCandidateCount: preparingSnapshot.size,
  }
}

module.exports = { claimTeamRosterProjectionJob, updateStage, complete, supersede, fail, requeueExpiredTeamRosterProjectionJobs }
