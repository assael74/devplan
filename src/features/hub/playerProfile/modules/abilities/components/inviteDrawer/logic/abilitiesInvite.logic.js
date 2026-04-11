//  features/hub/playerProfile/modules/abilities/components/inviteDrawer/logic/abilitiesInvite.logic.js

import { createAbilitiesInvite } from '../../../../../../../abilitiesPublic/invites/abilitiesInvites.create.service.js'
import roleImage from '../../../../../../../../ui/core/images/roleImage.png'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

export function clean(value) {
  return String(value ?? '').trim()
}

export function normalizeActiveDomains(value) {
  if (!Array.isArray(value)) return []

  const seen = new Set()
  const next = []

  for (const item of value) {
    const id = clean(item)
    if (!id || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }

  return next
}

export function buildRolesPool(context = {}) {
  return Array.isArray(context?.roles) ? context.roles.filter(Boolean) : []
}

export function buildEvaluatorFromRoles(roles = [], selectedId = '') {
  const safeId = clean(selectedId)
  if (!safeId) return null

  const role = roles.find((item) => clean(item?.id) === safeId)
  if (!role) return null

  return {
    id: clean(role?.id),
    fullName: clean(role?.fullName),
    type: clean(role?.type),
    photo: clean(role?.photo),
  }
}

export function buildPlayerLabel(player = {}) {
  return clean(player?.playerFullName || player?.fullName || player?.name || 'שחקן')
}

export function resolveRolePhoto(photo) {
  return clean(photo) || roleImage
}

export function resolvePlayerPhoto(player = {}) {
  return clean(player?.photo) || playerImage
}

export async function copyText(value) {
  const safe = clean(value)
  if (!safe) return false

  try {
    await navigator.clipboard.writeText(safe)
    return true
  } catch {
    return false
  }
}

export function openWhatsapp(text) {
  const safe = clean(text)
  if (!safe) return
  const url = `https://wa.me/?text=${encodeURIComponent(safe)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function buildInviteInitialState() {
  return {
    selectedEvaluatorId: '',
    selectedDomains: [],
    pending: false,
    error: '',
    copied: false,
    createdState: null,
  }
}

export function getInviteIsValid({ player, playerName, evaluator }) {
  return Boolean(clean(player?.id) && clean(playerName) && clean(evaluator?.id))
}

export function getInviteCanSave({ isValid, pending, createdState }) {
  return Boolean(isValid && !pending && !createdState)
}

export function getCreatedLink(createdState) {
  return clean(createdState?.invite?.link)
}

export function getCreatedWhatsappText(createdState) {
  return clean(createdState?.whatsappText)
}

export async function createInviteFlow({
  player,
  evaluator,
  creatorMeta = {},
  activeDomains = []
}) {
  return createAbilitiesInvite({
    player,
    evaluator,
    meta: {
      ...creatorMeta,
      activeDomains: normalizeActiveDomains(activeDomains),
    },
  })
}
