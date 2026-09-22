const { onSchedule } = require('firebase-functions/v2/scheduler')
const { REGION } = require('../../services/notifications/scheduleNotify')
const { requeueExpiredTeamRosterProjectionJobs } = require('../../services/playersDatabase/teamRosterProjectionJobs/teamRosterProjectionJob.repository')

const recoverExpiredTeamRosterProjectionJobs = onSchedule(
  { region: REGION, schedule: 'every 15 minutes' },
  async () => requeueExpiredTeamRosterProjectionJobs()
)

module.exports = { recoverExpiredTeamRosterProjectionJobs }
