// C:/projects/devplan/functions/src/triggers/playersDatabase/onLeagueProjectionJobCreated.trigger.js

const { onDocumentWritten } = require('firebase-functions/v2/firestore')

const { REGION } = require('../../services/notifications/scheduleNotify')
const {
  runLeagueProjectionJob,
} = require('../../services/playersDatabase/leagueProjectionJobs/leagueProjectionJob.runner')

const onLeagueProjectionJobWritten = onDocumentWritten(
  {
    region: REGION,
    document: 'dbLeagueProjectionJobs/{jobId}',
  },
  async event => {
    const jobId = String(event.params?.jobId || '').trim()
    if (!jobId) return

    try {
      await runLeagueProjectionJob(jobId)
    } catch (error) {
      console.error('League projection job failed', {
        jobId,
        message: error?.message,
        code: error?.code,
      })
    }
  }
)

module.exports = {
  onLeagueProjectionJobWritten,
}
