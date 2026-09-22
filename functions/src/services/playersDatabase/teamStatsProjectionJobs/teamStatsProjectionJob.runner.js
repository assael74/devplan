const { db } = require('../../../config/admin')
const { claimTeamStatsProjectionJob, updateStage, complete, supersede, fail } = require('./teamStatsProjectionJob.repository')
const { updateWriteActionFromProjectionJob } = require('../writeActions/writeAction.repository')

const clean = value => String(value === undefined || value === null ? '' : value).trim()

async function readCanonicalTeamSeason(job) {
  const id = clean(job.teamSeasonDocumentId)
  const snapshot = await db.collection('dbBirthTeamSeasons').doc(id).get()
  if (!snapshot.exists) throw new Error('Canonical Team Season was not found')
  const season = snapshot.data() || {}
  if (clean(season.statsProjectionRevision) !== clean(job.sourceRevision)) {
    return { stale: true, teamSeasonDocumentId: id }
  }
  return {
    teamSeasonDocumentId: id,
    teamId: clean(season.birthTeamDocumentId || season.teamDocumentId || job.teamId),
    seasonKey: clean(season.seasonKey || job.seasonKey),
    seasonStatus: clean(season.seasonStatus),
    playerDocumentIds: [...new Set((Array.isArray(season.teamPlayers) ? season.teamPlayers : [])
      .map(player => clean(player.playerDocumentId)).filter(Boolean))],
    playersCount: Array.isArray(season.teamPlayers) ? season.teamPlayers.length : 0,
  }
}

async function inspectPlayerDocuments(source) {
  const ids = source.playerDocumentIds || []
  const snapshots = ids.length ? await db.getAll(...ids.map(id => db.collection('dbPlayers').doc(id))) : []
  const missingPlayerDocumentIds = snapshots.filter(snapshot => !snapshot.exists).map(snapshot => snapshot.id)
  return { expectedCount: ids.length, existingCount: ids.length - missingPlayerDocumentIds.length, missingPlayerDocumentIds }
}

async function inspectIndexes(source) {
  const playerIndexes = await db.collection('dbSearchIndexes')
    .where('birthTeamId', '==', source.teamId)
    .where('seasonKey', '==', source.seasonKey)
    .where('entityType', '==', 'playerSeason').get()
  return { playerIndexCount: playerIndexes.size, playerIndexDocumentIds: playerIndexes.docs.map(snapshot => snapshot.id) }
}

async function runTeamStatsProjectionJob(jobId) {
  const job = await claimTeamStatsProjectionJob(jobId)
  if (!job) return { skipped: true, reason: 'jobNotClaimed' }
  const identity = { jobId, sourceRevision: job.sourceRevision, attemptToken: job.attemptToken }
  try {
    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'processing',
    })
    const canonicalSource = await readCanonicalTeamSeason(job)
    if (canonicalSource.stale) {
      const transition = await supersede(identity)
      if (transition?.applied) await updateWriteActionFromProjectionJob({
        writeActionId: job.writeActionId, jobId, jobType: job.jobType,
        sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'superseded',
      })
      return { skipped: true, reason: 'staleSource' }
    }
    await updateStage({ ...identity, stage: 'canonicalSource', result: canonicalSource })
    const playerDocuments = await inspectPlayerDocuments(canonicalSource)
    await updateStage({ ...identity, stage: 'playerDocuments', result: playerDocuments })
    const playerIndexes = await inspectIndexes(canonicalSource)
    await updateStage({ ...identity, stage: 'playerIndexes', result: playerIndexes })
    await updateStage({ ...identity, stage: 'teamAndLeagueIndexes', result: { teamSeasonDocumentId: canonicalSource.teamSeasonDocumentId } })
    await updateStage({ ...identity, stage: 'clubProjection', result: { checked: true } })
    const completion = await complete(identity)
    if (!completion?.applied) return { skipped: true, reason: 'staleAttempt' }
    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'completed',
    })
    return { completed: true, canonicalSource, playerDocuments, playerIndexes }
  } catch (error) {
    const transition = await fail({ ...identity, error })
    if (transition?.applied) await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'failed', error,
    })
    throw error
  }
}

module.exports = { runTeamStatsProjectionJob }
