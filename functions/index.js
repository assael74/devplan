// functions/index.js
const { submitPublicAbilitiesInvite } = require('./src/http/abilities/submitPublicAbilitiesInvite.http')
const { shareAbilitiesInvite } = require('./src/http/share/shareAbilitiesInvite.http')
const { shareReport } = require('./src/http/share/shareReport.http')
const { notifyNow } = require('./src/http/notifications/notifyNow.http')
const { onMeetingCreated } = require('./src/triggers/meetings/onMeetingCreated.trigger')
const { onPendingRegistrationCreated } = require('./src/triggers/roles/onPendingRegistrationCreated.trigger')
const { firestoreOfficialUsage } = require('./src/http/firestoreUsage/firestoreOfficialUsage.http')
const { playerNarrative } = require('./src/http/narrative/playerNarrative.http')
const {
  onLeagueProjectionJobWritten,
} = require('./src/triggers/playersDatabase/onLeagueProjectionJobCreated.trigger')
const {
  onTeamStatsProjectionJobWritten,
} = require('./src/triggers/playersDatabase/onTeamStatsProjectionJobCreated.trigger')
const {
  onTeamRosterProjectionJobWritten,
} = require('./src/triggers/playersDatabase/onTeamRosterProjectionJobCreated.trigger')
const {
  recoverExpiredLeagueProjectionJobs,
} = require('./src/triggers/playersDatabase/recoverExpiredLeagueProjectionJobs.trigger')
const {
  recoverExpiredTeamStatsProjectionJobs,
} = require('./src/triggers/playersDatabase/recoverExpiredTeamStatsProjectionJobs.trigger')
const {
  recoverExpiredTeamRosterProjectionJobs,
} = require('./src/triggers/playersDatabase/recoverExpiredTeamRosterProjectionJobs.trigger')

exports.submitPublicAbilitiesInvite = submitPublicAbilitiesInvite
exports.shareAbilitiesInvite = shareAbilitiesInvite
exports.shareReport = shareReport
exports.notifyNow = notifyNow
exports.onMeetingCreated = onMeetingCreated
exports.onPendingRegistrationCreated = onPendingRegistrationCreated

exports.firestoreOfficialUsage = firestoreOfficialUsage

exports.playerNarrative = playerNarrative
exports.onLeagueProjectionJobWritten = onLeagueProjectionJobWritten
exports.onTeamStatsProjectionJobWritten = onTeamStatsProjectionJobWritten
exports.onTeamRosterProjectionJobWritten = onTeamRosterProjectionJobWritten
exports.recoverExpiredLeagueProjectionJobs = recoverExpiredLeagueProjectionJobs
exports.recoverExpiredTeamStatsProjectionJobs = recoverExpiredTeamStatsProjectionJobs
exports.recoverExpiredTeamRosterProjectionJobs = recoverExpiredTeamRosterProjectionJobs
