// features/abilitiesPublic/invites/abilitiesInvites.create.payloads.js

import { addDaysIso, createAbilitiesInviteToken } from './abilitiesInvites.create.helpers.js'

function clean(v) {
  return String(v ?? '').trim()
}

function normalizeActiveDomains(value) {
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

function pickPlayerSnapshot(player = {}) {
  return {
    id: clean(player?.id),
    fullName: clean(player?.playerFullName || player?.fullName || player?.name),
    photo: clean(player?.photo),
  }
}

function pickEvaluatorSnapshot(evaluator = {}) {
  return {
    id: clean(evaluator?.id),
    fullName: clean(evaluator?.name || evaluator?.fullName),
    photo: clean(evaluator?.photo),
    type: clean(evaluator?.type || evaluator?.roleType || evaluator?.roleName),
  }
}

function pickTeamSnapshot(player = {}) {
  const team = player?.team || {}

  return {
    id: clean(player?.teamId || team?.id),
    teamName: clean(player?.teamName || team?.teamName || team?.name),
    photo: clean(player?.teamPhoto || team?.photo),
    teamYear: clean(player?.teamYear || team?.teamYear || team?.year),
  }
}

function pickClubSnapshot(player = {}) {
  const club = player?.club || {}

  return {
    id: clean(player?.clubId || club?.id),
    clubName: clean(player?.clubName || club?.clubName || club?.name),
    photo: clean(player?.clubPhoto || club?.photo),
  }
}

export function buildCreateAbilitiesInvitePayload({
  player,
  evaluator,
  defaults = {},
  meta = {},
}) {
  const now = new Date().toISOString()
  const token = createAbilitiesInviteToken()

  return {
    id: '',
    token,
    formType: 'abilities',

    player: pickPlayerSnapshot(player),
    evaluator: pickEvaluatorSnapshot(evaluator),
    team: pickTeamSnapshot(player),
    club: pickClubSnapshot(player),

    createdById: clean(meta?.createdById || evaluator?.id),
    createdByName: clean(meta?.createdByName || evaluator?.name || evaluator?.fullName),

    status: 'sent',
    source: 'playerAbilitiesModule',

    active: true,
    isOpened: false,
    isSubmitted: false,
    opensCount: 0,

    createdAt: now,
    sentAt: now,
    openedAt: '',
    submittedAt: '',
    expiresAt: clean(meta?.expiresAt) || addDaysIso(meta?.expiresInDays || 7),

    link: clean(meta?.link),
    whatsappText: clean(meta?.whatsappText),
    note: clean(meta?.note),

    meta: {
      allowRoleEdit: meta?.allowRoleEdit !== false,
      allowGrowthStageEdit: meta?.allowGrowthStageEdit !== false,
      singleUse: meta?.singleUse !== false,
      createdBy: clean(meta?.createdBy),
      activeDomains: normalizeActiveDomains(meta?.activeDomains),
    },
  }
}

export function validateCreateAbilitiesInvitePayload(payload = {}) {
  const errors = {}

  if (!clean(payload?.token)) {
    errors.token = 'חסר token'
  }

  if (!clean(payload?.player?.id)) {
    errors.playerId = 'חסר player.id'
  }

  if (!clean(payload?.player?.fullName)) {
    errors.playerName = 'חסר player.fullName'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
