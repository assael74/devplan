// features/abilitiesPublic/shared/abilitiesPublic.prefill.js

import { clean, todayYmd } from './abilitiesPublic.helpers.js'

export function buildPublicDraftFromInvite(invite = {}) {
  const meta = invite?.meta || {}
  const defaults = invite?.defaults || {}

  return {
    inviteId: clean(invite?.id),
    token: clean(invite?.token),

    playerId: clean(invite?.player?.id),
    playerName: clean(invite?.player?.fullName),
    playerPhoto: clean(invite?.player?.photo),

    teamId: clean(invite?.team?.id),
    teamName: clean(invite?.team?.teamName),
    teamPhoto: clean(invite?.team?.photo),
    teamYear: clean(invite?.team?.teamYear),

    clubId: clean(invite?.club?.id),
    clubName: clean(invite?.club?.clubName),
    clubPhoto: clean(invite?.club?.photo),

    evaluatorId: clean(invite?.evaluator?.id),
    evaluatorName: clean(invite?.evaluator?.fullName),
    evaluatorPhoto: clean(invite?.evaluator?.photo),
    evaluatorType: clean(invite?.evaluator?.type),

    createdById: clean(invite?.createdById),
    createdByName: clean(invite?.createdByName),

    evalDate: todayYmd(),
    roleId: clean(defaults?.roleId || invite?.roleId || ''),
    abilities: {},
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
