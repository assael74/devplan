export function buildAbilitiesInviteModel(raw = {}) {
  return {
    id: raw?.id || '',
    token: raw?.token || '',
    formType: raw?.formType || 'abilities',

    playerId: raw?.playerId || '',
    playerName: raw?.playerName || '',
    teamId: raw?.teamId || '',
    teamName: raw?.teamName || '',
    clubId: raw?.clubId || '',
    clubName: raw?.clubName || '',

    evaluatorId: raw?.evaluatorId || '',
    evaluatorName: raw?.evaluatorName || '',
    evaluatorType: raw?.evaluatorType || '',

    defaultRoleId: raw?.defaultRoleId || '',
    defaultGrowthStage: raw?.defaultGrowthStage ?? '',

    status: raw?.status || 'sent',
    createdAt: raw?.createdAt || '',
    sentAt: raw?.sentAt || '',
    openedAt: raw?.openedAt || '',
    submittedAt: raw?.submittedAt || '',
    expiresAt: raw?.expiresAt || '',

    link: raw?.link || '',

    meta: {
      allowRoleEdit: raw?.meta?.allowRoleEdit !== false,
      allowGrowthStageEdit: raw?.meta?.allowGrowthStageEdit !== false,
      singleUse: raw?.meta?.singleUse !== false,
    },
  }
}
