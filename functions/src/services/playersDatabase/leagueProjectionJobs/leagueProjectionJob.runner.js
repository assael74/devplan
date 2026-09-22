const {
  claimLeagueProjectionJob,
  completeLeagueProjectionJob,
  failLeagueProjectionJob,
  supersedeLeagueProjectionJob,
  updateLeagueProjectionJobStage,
} = require('./leagueProjectionJob.repository')
const { updateWriteActionFromProjectionJob } = require('../writeActions/writeAction.repository')
const {
  updateTeamSeasonLeaguePerformance,
} = require('./teamSeasonPerformance.write')
const {
  updateTeamSeasonSearchIndexes,
} = require('./teamSeasonSearchIndex.write')
const { db } = require('../../../config/admin')

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolveCanonicalSeason = ({ league = {}, seasonKey = '', target = 'current' } = {}) => (
  target === 'history'
    ? (Array.isArray(league.history) ? league.history : []).find(season => (
        clean(season?.seasonKey || season?.seasonId) === clean(seasonKey)
      )) || null
    : league.current || null
)

async function readCanonicalLeagueSource(job) {
  const leagueId = clean(job.leagueId || job.source?.league?.id)
  const seasonKey = clean(job.seasonKey || job.source?.season?.seasonKey || job.source?.season?.seasonId)
  const target = clean(job.target || job.source?.target) || 'current'
  if (!leagueId || !seasonKey) throw new Error('League projection job is missing canonical identity')

  const snapshot = await db.collection('dbLeagues').doc(leagueId).get()
  if (!snapshot.exists) throw new Error('Canonical league document was not found')

  const league = snapshot.data() || {}
  const season = resolveCanonicalSeason({ league, seasonKey, target })
  if (!season) throw new Error('Canonical league season was not found')
  if (clean(season.sourceRevision) !== clean(job.sourceRevision)) return { stale: true }

  return {
    league: { id: leagueId, leagueId, level: league.level },
    season,
    target,
    tableRank: Array.isArray(season.tableRank) ? season.tableRank : [],
  }
}

async function markSuperseded({ job, jobId }) {
  const transition = await supersedeLeagueProjectionJob({
    jobId,
    sourceRevision: job.sourceRevision,
    attemptToken: job.attemptToken,
  })
  if (transition?.applied) await updateWriteActionFromProjectionJob({
    writeActionId: job.writeActionId,
    jobId,
    jobType: job.jobType,
    sourceRevision: job.sourceRevision,
    attemptToken: job.attemptToken,
    status: 'superseded',
  })
}

async function runLeagueProjectionJob(jobId) {
  const job = await claimLeagueProjectionJob(jobId)
  if (!job) return { skipped: true, reason: 'jobNotClaimed' }

  try {
    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'processing',
    })

    const source = await readCanonicalLeagueSource(job)
    if (source.stale) {
      await markSuperseded({ job, jobId })
      return { skipped: true, reason: 'staleCanonicalSource' }
    }

    const teamSeasonPerformance = await updateTeamSeasonLeaguePerformance({
      source,
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
    })
    if (teamSeasonPerformance.stale) {
      await markSuperseded({ job, jobId })
      return { skipped: true, reason: 'staleAttempt' }
    }
    const stageUpdate = await updateLeagueProjectionJobStage({
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
      stage: 'teamSeasonProjections',
      status: 'completed',
      result: teamSeasonPerformance,
    })
    if (!stageUpdate.applied) return { skipped: true, reason: 'staleAttempt' }

    const teamIndexes = await updateTeamSeasonSearchIndexes({
      source,
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
    })
    if (teamIndexes.stale) {
      await markSuperseded({ job, jobId })
      return { skipped: true, reason: 'staleAttempt' }
    }
    const indexStageUpdate = await updateLeagueProjectionJobStage({
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
      stage: 'teamIndexes',
      status: 'completed',
      result: teamIndexes,
    })
    if (!indexStageUpdate.applied) return { skipped: true, reason: 'staleAttempt' }

    const completion = await completeLeagueProjectionJob({
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
    })
    if (!completion.applied) return { skipped: true, reason: 'staleAttempt' }

    await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'completed',
    })

    return { completed: true, teamSeasonPerformance, teamIndexes }
  } catch (error) {
    const transition = await failLeagueProjectionJob({
      jobId,
      sourceRevision: job.sourceRevision,
      attemptToken: job.attemptToken,
      error,
    })
    if (transition?.applied) await updateWriteActionFromProjectionJob({
      writeActionId: job.writeActionId, jobId, jobType: job.jobType,
      sourceRevision: job.sourceRevision, attemptToken: job.attemptToken, status: 'failed', error,
    })
    throw error
  }
}

module.exports = {
  readCanonicalLeagueSource,
  runLeagueProjectionJob,
}