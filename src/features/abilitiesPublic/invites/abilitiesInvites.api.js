// src/features/abilitiesPublic/invites/abilitiesInvites.api.js

import {
  getAbilitiesInviteByToken,
  markAbilitiesInviteOpened,
} from './abilitiesInvites.firestore.js'

function clean(value) {
  return String(value ?? '').trim()
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch (error) {
    return null
  }
}

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
  const response = await fetch('/api/public/abilities/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  })

  const data = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(
      clean(data?.error) ||
      clean(data?.message) ||
      `submitAbilitiesInviteFormApi failed (${response.status})`
    )
  }

  return data || { ok: true }
}
