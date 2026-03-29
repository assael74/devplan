// features/abilitiesPublic/invites/abilitiesInvites.service.js

import { buildAbilitiesInviteModel } from './abilitiesInvites.model.js'
import {
  buildAbilitiesInviteLink,
  buildAbilitiesWhatsappText,
} from './abilitiesInvites.create.helpers.js'
import {
  buildCreateAbilitiesInvitePayload,
  validateCreateAbilitiesInvitePayload,
} from './abilitiesInvites.create.payloads.js'
import { saveAbilitiesInvite } from './abilitiesInvites.firestore.js'

function clean(v) {
  return String(v ?? '').trim()
}

function resolveOrigin(explicitOrigin) {
  if (clean(explicitOrigin)) return clean(explicitOrigin)

  if (typeof window !== 'undefined' && window?.location?.origin) {
    return window.location.origin
  }

  return ''
}

export function buildCreatedAbilitiesInvite({
  player,
  evaluator,
  defaults,
  meta,
  origin,
}) {
  const payload = buildCreateAbilitiesInvitePayload({
    player,
    evaluator,
    defaults,
    meta,
  })

  const validation = validateCreateAbilitiesInvitePayload(payload)
  if (!validation.isValid) {
    const error = new Error('יצירת invite נכשלה')
    error.validation = validation
    throw error
  }

  const safeOrigin = resolveOrigin(origin)

  const link = buildAbilitiesInviteLink({
    origin: safeOrigin,
    token: payload.token,
    playerName: payload.playerName,
  })

  const baseInvite = buildAbilitiesInviteModel({
    ...payload,
    id: payload.id || `invite_${Date.now()}`,
    link,
  })

  const whatsappText = buildAbilitiesWhatsappText({
    ...baseInvite,
    link,
  })

  const invite = {
    ...baseInvite,
    whatsappText,
  }

  return {
    invite,
    whatsappText,
  }
}

export async function createAbilitiesInvite({
  player,
  evaluator,
  defaults,
  meta,
  origin,
}) {
  const created = buildCreatedAbilitiesInvite({
    player,
    evaluator,
    defaults,
    meta,
    origin,
  })

  const savedInvite = await saveAbilitiesInvite(created.invite)

  return {
    ...created,
    invite: {
      ...created.invite,
      id: savedInvite.id || created.invite.id,
    },
  }
}
