// src/features/abilitiesPublic/invites/abilitiesInvites.api.js

import {
  getAbilitiesInviteByToken,
  markAbilitiesInviteOpened,
} from './abilitiesInvites.firestore.js'

import { submitAbilitiesInviteWithHistory } from './abilitiesInvites.submit.service.js'

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
  return await submitAbilitiesInviteWithHistory(payload)
}
