// C:/projects/devplan/functions/src/triggers/playersDatabase/recoverExpiredLeagueProjectionJobs.trigger.js

const { onSchedule } = require('firebase-functions/v2/scheduler')

const { REGION } = require('../../services/notifications/scheduleNotify')
const {
  requeueExpiredLeagueProjectionJobs,
} = require('../../services/playersDatabase/leagueProjectionJobs/leagueProjectionJob.repository')

const recoverExpiredLeagueProjectionJobs = onSchedule(
  {
    region: REGION,
    schedule: 'every 15 minutes',
  },
  async () => requeueExpiredLeagueProjectionJobs()
)

module.exports = {
  recoverExpiredLeagueProjectionJobs,
}
