const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { REGION } = require('../../services/notifications/scheduleNotify')
const { runTeamRosterProjectionJob } = require('../../services/playersDatabase/teamRosterProjectionJobs/teamRosterProjectionJob.runner')

const onTeamRosterProjectionJobWritten = onDocumentWritten({
  region: REGION,
  document: 'dbTeamRosterProjectionJobs/{jobId}',
}, async event => {
  const jobId = String(event.params?.jobId || '').trim()
  if (!jobId) return
  try {
    await runTeamRosterProjectionJob(jobId)
  } catch (error) {
    console.error('Team roster projection job failed', { jobId, message: error?.message, code: error?.code })
  }
})

module.exports = { onTeamRosterProjectionJobWritten }
