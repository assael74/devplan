// functions/index.js
const { submitPublicAbilitiesInvite } = require('./src/http/abilities/submitPublicAbilitiesInvite.http')
const { shareAbilitiesInvite } = require('./src/http/share/shareAbilitiesInvite.http')
const { shareReport } = require('./src/http/share/shareReport.http')
const { notifyNow } = require('./src/http/notifications/notifyNow.http')
const { onMeetingCreated } = require('./src/triggers/meetings/onMeetingCreated.trigger')
const { onPendingRegistrationCreated } = require('./src/triggers/roles/onPendingRegistrationCreated.trigger')
const { firestoreOfficialUsage } = require('./src/http/firestoreUsage/firestoreOfficialUsage.http')
const { onCall } = require('firebase-functions/v2/https')
const { createProjectDocumentsHandler } = require('./src/http/projectDocuments/projectDocuments.http')

exports.submitPublicAbilitiesInvite = submitPublicAbilitiesInvite
exports.shareAbilitiesInvite = shareAbilitiesInvite
exports.shareReport = shareReport
exports.notifyNow = notifyNow
exports.onMeetingCreated = onMeetingCreated
exports.onPendingRegistrationCreated = onPendingRegistrationCreated

exports.firestoreOfficialUsage = firestoreOfficialUsage
exports.readProjectDocuments = onCall(
  { region: 'europe-west1', invoker: 'public', maxInstances: 1 },
  createProjectDocumentsHandler(() => require('./generated/project-documents.json'))
)

