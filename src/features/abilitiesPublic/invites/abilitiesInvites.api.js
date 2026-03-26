// src/features/abilitiesPublic/invites/abilitiesInvites.api.js

import {
  getAbilitiesInviteByToken,
  markAbilitiesInviteOpened,
  markAbilitiesInviteSubmitted,
} from './abilitiesInvites.firestore.js'

export async function getAbilitiesInviteByTokenApi(token) {
  return await getAbilitiesInviteByToken(token)
}

export async function markAbilitiesInviteOpenedApi(invite) {
  if (!invite?.id) {
    throw new Error('markAbilitiesInviteOpenedApi: invite.id is required')
  }

  await markAbilitiesInviteOpened(invite.id, invite)

  return {
    ...invite,
    isOpened: true,
    opensCount: Number(invite?.opensCount || 0) + 1,
  }
}

export async function submitAbilitiesInviteFormApi(payload) {
  if (!payload?.inviteId) {
    throw new Error('submitAbilitiesInviteFormApi: inviteId is required')
  }

  await markAbilitiesInviteSubmitted(payload.inviteId, payload)

  return {
    ok: true,
    inviteId: payload.inviteId,
  }
}
