// C:/projects/devplan/functions/src/services/playersDatabase/leagueProjectionJob.contract.js

const LEAGUE_PROJECTION_JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  PARTIAL: 'partial',
  SUPERSEDED: 'superseded',
  COMPLETED: 'completed',
  FAILED: 'failed',
}

const LEAGUE_PROJECTION_JOB_STAGES = [
  'teamSeasonProjections',
  'teamIndexes',
]

module.exports = {
  LEAGUE_PROJECTION_JOB_STAGES,
  LEAGUE_PROJECTION_JOB_STATUS,
}
