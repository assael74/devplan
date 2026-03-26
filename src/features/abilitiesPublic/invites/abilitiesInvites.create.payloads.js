import { addDaysIso, createAbilitiesInviteToken } from './abilitiesInvites.create.helpers.js'

function clean(v) {
  return String(v ?? '').trim()
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

    playerId: clean(player?.id),
    playerName: clean(player?.playerFullName || player?.fullName || player?.name),
    teamId: clean(player?.teamId || player?.team?.id),
    teamName: clean(player?.teamName || player?.team?.teamName || player?.team?.name),
    clubId: clean(player?.clubId || player?.club?.id),
    clubName: clean(player?.clubName || player?.club?.clubName || player?.club?.name),

    evaluatorId: clean(evaluator?.id),
    evaluatorName: clean(evaluator?.name || evaluator?.fullName),
    evaluatorType: clean(evaluator?.type || evaluator?.roleType || evaluator?.roleName),

    defaultRoleId: clean(defaults?.roleId),
    defaultGrowthStage: defaults?.growthStage ?? '',

    status: 'sent',
    createdAt: now,
    sentAt: now,
    openedAt: '',
    submittedAt: '',
    expiresAt: clean(meta?.expiresAt) || addDaysIso(meta?.expiresInDays || 7),

    meta: {
      allowRoleEdit: meta?.allowRoleEdit !== false,
      allowGrowthStageEdit: meta?.allowGrowthStageEdit !== false,
      singleUse: meta?.singleUse !== false,
      note: clean(meta?.note),
      createdBy: clean(meta?.createdBy),
    },
  }
}

export function validateCreateAbilitiesInvitePayload(payload = {}) {
  const errors = {}

  if (!clean(payload?.token)) {
    errors.token = 'חסר token'
  }

  if (!clean(payload?.playerId)) {
    errors.playerId = 'חסר playerId'
  }

  if (!clean(payload?.playerName)) {
    errors.playerName = 'חסר playerName'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
