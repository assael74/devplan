// C:\projects\devplan\functions\src\services\abilities\buildPublicAbilitiesDraft.js

const { clean } = require('../../shared/clean')

function buildPublicAbilitiesDraft(payload = {}) {
  return {
    playerId: clean(payload?.playerId),
    evalDate: clean(payload?.evalDate),
    abilities: { ...(payload?.abilities || {}) },
    source: 'public_invite',
    evaluatorId: clean(payload?.evaluatorId),
    createdById: clean(payload?.createdById),
    publicMeta: {
      inviteId: clean(payload?.inviteId),
      token: clean(payload?.token),
      evaluatorId: clean(payload?.evaluatorId),
      evaluatorName: clean(payload?.evaluatorName),
      evaluatorType: clean(payload?.evaluatorType),
      teamId: clean(payload?.teamId),
      teamName: clean(payload?.teamName),
      teamYear: clean(payload?.teamYear),
      clubId: clean(payload?.clubId),
      clubName: clean(payload?.clubName),
    },
  }
}

module.exports = { buildPublicAbilitiesDraft }
