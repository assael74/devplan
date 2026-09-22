const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { REGION } = require('../../services/notifications/scheduleNotify')
const { runTeamStatsProjectionJob } = require('../../services/playersDatabase/teamStatsProjectionJobs/teamStatsProjectionJob.runner')

const onTeamStatsProjectionJobWritten = onDocumentWritten({
  region: REGION,
  document: 'dbTeamStatsProjectionJobs/{jobId}',
}, async event => {
  const jobId = String(event.params?.jobId || '').trim()
  if (!jobId) return
  try {
    await runTeamStatsProjectionJob(jobId)
  } catch (error) {
    console.error('Team stats projection job failed', { jobId, message: error?.message, code: error?.code })
  }
})

module.exports = { onTeamStatsProjectionJobWritten }
