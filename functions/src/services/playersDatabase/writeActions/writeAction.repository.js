const { admin, db } = require('../../../config/admin')

const COLLECTION = 'dbWriteActions'
const JOB_COLLECTION_BY_TYPE = {
  league_projection_sync: 'dbLeagueProjectionJobs',
  team_stats_projection_sync: 'dbTeamStatsProjectionJobs',
  team_roster_projection_sync: 'dbTeamRosterProjectionJobs',
}
const JOB_STATUS_BY_RECEIPT_STATUS = {
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
  superseded: 'superseded',
}
const clean = value => String(value === undefined || value === null ? '' : value).trim()

const canUpdateReceipt = ({
  receipt = {}, jobId = '', sourceRevision = '', attemptToken = '', retryOfJobId = '',
  allowAttemptTakeover = false,
} = {}) => {
  const receiptJobId = clean(receipt.projectionJobId)
  const receiptRevision = clean(receipt.sourceRevision)
  const isSameProjection = (!receiptJobId || receiptJobId === clean(jobId)) &&
    (!receiptRevision || receiptRevision === clean(sourceRevision))
  // A retry may replace a failed Job with a new Job and a newer League
  // revision, but only when that new Job explicitly continues this receipt.
  const isVerifiedRetry = allowAttemptTakeover && receiptJobId &&
    clean(retryOfJobId) === receiptJobId

  return (isSameProjection || isVerifiedRetry) &&
    (allowAttemptTakeover || !clean(attemptToken) || !clean(receipt.projectionAttemptToken) ||
      clean(receipt.projectionAttemptToken) === clean(attemptToken))
}

async function updateWriteActionFromProjectionJob({
  writeActionId = '',
  jobId = '',
  jobType = '',
  sourceRevision = '',
  attemptToken = '',
  status = '',
  error = null,
} = {}) {
  const actionId = clean(writeActionId)
  if (!actionId) return { applied: false, reason: 'missingWriteActionId' }
  const jobCollection = JOB_COLLECTION_BY_TYPE[clean(jobType)]
  const expectedJobStatus = JOB_STATUS_BY_RECEIPT_STATUS[clean(status)]
  if (!jobCollection || !expectedJobStatus) {
    return { applied: false, reason: 'unsupportedProjectionJob' }
  }

  return db.runTransaction(async transaction => {
    const reference = db.collection(COLLECTION).doc(actionId)
    const jobReference = db.collection(jobCollection).doc(clean(jobId))
    const [snapshot, jobSnapshot] = await Promise.all([
      transaction.get(reference),
      transaction.get(jobReference),
    ])
    if (!snapshot.exists) return { applied: false, reason: 'writeActionMissing' }
    if (!jobSnapshot.exists) return { applied: false, reason: 'projectionJobMissing' }
    const job = jobSnapshot.data() || {}
    const isCurrentJobAttempt = (
      clean(job.sourceRevision) === clean(sourceRevision) &&
      clean(job.attemptToken) === clean(attemptToken) &&
      clean(job.status) === expectedJobStatus
    )
    if (!isCurrentJobAttempt) return { applied: false, reason: 'staleProjectionAttempt' }
    const receipt = snapshot.data() || {}
    if (!canUpdateReceipt({
      // Token takeover is safe only after the Job document has proved that
      // this is the active leased attempt in this same transaction.
      receipt,
      jobId,
      sourceRevision,
      attemptToken,
      retryOfJobId: job.retryOfJobId,
      allowAttemptTakeover: status === 'processing',
    })) {
      return { applied: false, reason: 'differentProjectionJob' }
    }

    const patch = {
      projectionJobId: clean(jobId),
      projectionJobType: clean(jobType),
      sourceRevision: clean(sourceRevision),
      ...(clean(attemptToken) ? { projectionAttemptToken: clean(attemptToken) } : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (status === 'processing') {
      patch.status = 'in_progress'
      patch.projectionStartedAt = admin.firestore.FieldValue.serverTimestamp()
    } else if (status === 'completed') {
      patch.status = 'completed'
      patch.recoveryRequired = false
      patch.completedAt = admin.firestore.FieldValue.serverTimestamp()
      patch.projectionCompletedAt = admin.firestore.FieldValue.serverTimestamp()
      patch.errorMessage = ''
      patch.failedStage = ''
    } else if (status === 'superseded') {
      patch.status = 'superseded'
      patch.recoveryRequired = false
      patch.supersededAt = admin.firestore.FieldValue.serverTimestamp()
    } else if (status === 'failed') {
      patch.status = 'failed_after_canonical_commit'
      patch.recoveryRequired = true
      patch.failedStage = 'projectionJob'
      patch.errorMessage = String(error?.message || 'Background projection job failed')
      patch.failedAt = admin.firestore.FieldValue.serverTimestamp()
    }

    transaction.update(reference, patch)
    return { applied: true }
  })
}

module.exports = { updateWriteActionFromProjectionJob }
