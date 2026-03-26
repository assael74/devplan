import { clean, todayYmd } from './abilitiesPublic.helpers.js'

export function buildPublicDraftFromInvite(invite = {}) {
  const meta = invite?.meta || {}

  return {
    inviteId: clean(invite?.id),
    token: clean(invite?.token),

    playerId: clean(invite?.playerId),
    playerName: clean(invite?.playerName),
    teamId: clean(invite?.teamId),
    teamName: clean(invite?.teamName),
    clubId: clean(invite?.clubId),
    clubName: clean(invite?.clubName),

    evaluatorId: clean(invite?.evaluatorId),
    evaluatorName: clean(invite?.evaluatorName),
    evaluatorType: clean(invite?.evaluatorType),

    evalDate: todayYmd(),
    roleId: clean(invite?.defaultRoleId || invite?.roleId || ''),
    abilities: {
      ...(invite?.defaultGrowthStage != null ? { growthStage: invite.defaultGrowthStage } : {}),
    },
    domainScores: {},

    publicMeta: {
      allowRoleEdit: meta?.allowRoleEdit !== false,
      allowGrowthStageEdit: meta?.allowGrowthStageEdit !== false,
      singleUse: meta?.singleUse !== false,
    },

    isDirty: false,
  }
}

export function buildPublicDraftHydrated(draft = {}, invite = {}) {
  const base = buildPublicDraftFromInvite(invite)

  return {
    ...base,
    ...draft,
    abilities: {
      ...(base?.abilities || {}),
      ...(draft?.abilities || {}),
    },
    domainScores: {
      ...(base?.domainScores || {}),
      ...(draft?.domainScores || {}),
    },
    publicMeta: {
      ...(base?.publicMeta || {}),
      ...(draft?.publicMeta || {}),
    },
  }
}
