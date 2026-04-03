import { upsertAbilitiesHistory } from '../../../services/firestore/shorts/abilities/abilitiesUpsertHistory.js'
import { markAbilitiesInviteSubmitted } from './abilitiesInvites.firestore.js'

function clean(value) {
  return String(value ?? '').trim()
}

function buildPublicAbilitiesDraft(payload = {}) {
  return {
    playerId: clean(payload?.playerId),
    evalDate: clean(payload?.evalDate),
    abilities: { ...(payload?.abilities || {}) },

    source: 'public_invite',

    publicMeta: {
      inviteId: clean(payload?.inviteId),
      token: clean(payload?.token),

      evaluatorId: clean(payload?.evaluatorId),
      evaluatorName: clean(payload?.evaluatorName),
      evaluatorType: clean(payload?.evaluatorType),

      teamId: clean(payload?.teamId),
      teamName: clean(payload?.teamName),

      clubId: clean(payload?.clubId),
      clubName: clean(payload?.clubName),
    },
  }
}

export async function submitAbilitiesInviteWithHistory(payload = {}) {
  console.log('submitAbilitiesInviteWithHistory payload', payload)

  const inviteId = clean(payload?.inviteId)
  if (!inviteId) {
    throw new Error('submitAbilitiesInviteWithHistory: inviteId is required')
  }

  const playerId = clean(payload?.playerId)
  if (!playerId) {
    throw new Error('submitAbilitiesInviteWithHistory: playerId is required')
  }

  const draft = buildPublicAbilitiesDraft(payload)
  console.log('submitAbilitiesInviteWithHistory draft', draft)

  const upsertResult = await upsertAbilitiesHistory({ draft })
  console.log('upsertResult', upsertResult)

  await markAbilitiesInviteSubmitted(inviteId, {
    submissionId: upsertResult?.ids?.formId || '',
    submittedById: clean(payload?.evaluatorId),
    submittedByName:
      clean(payload?.evaluatorName) ||
      clean(payload?.evaluatorType),

    response: {
      source: 'public_invite',
      playerId: clean(payload?.playerId),
      playerName: clean(payload?.playerName),
      evalDate: clean(payload?.evalDate),
      abilities: { ...(payload?.abilities || {}) },
      domainScores: { ...(payload?.domainScores || {}) },
    },
  })

  return {
    ok: true,
    inviteId,
    submissionId: upsertResult?.ids?.formId || '',
    abilitiesDocId: upsertResult?.ids?.abilitiesDocId || '',
    playerId,
  }
}
