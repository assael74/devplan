const { onSchedule } = require('firebase-functions/v2/scheduler')
const { REGION } = require('../../services/notifications/scheduleNotify')
const { requeueExpiredTeamStatsProjectionJobs } = require('../../services/playersDatabase/teamStatsProjectionJobs/teamStatsProjectionJob.repository')

const recoverExpiredTeamStatsProjectionJobs = onSchedule(
  { region: REGION, schedule: 'every 15 minutes' },
  async () => requeueExpiredTeamStatsProjectionJobs()
)

module.exports = { recoverExpiredTeamStatsProjectionJobs }
