// features/abilitiesPublic/invites/abilitiesInvites.model.js

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

function buildPlayerModel(raw = {}) {
  return {
    id: clean(raw?.id),
    fullName: clean(raw?.fullName),
    photo: clean(raw?.photo),
  }
}

function buildEvaluatorModel(raw = {}) {
  return {
    id: clean(raw?.id),
    fullName: clean(raw?.fullName),
    photo: clean(raw?.photo),
    type: clean(raw?.type),
  }
}

function buildTeamModel(raw = {}) {
  return {
    id: clean(raw?.id),
    teamName: clean(raw?.teamName),
    photo: clean(raw?.photo),
    teamYear: clean(raw?.teamYear),
  }
}

function buildClubModel(raw = {}) {
  return {
    id: clean(raw?.id),
    clubName: clean(raw?.clubName),
    photo: clean(raw?.photo),
  }
}

export function buildAbilitiesInviteModel(raw = {}) {
  return {
    id: clean(raw?.id),
    token: clean(raw?.token),
    formType: clean(raw?.formType || 'abilities'),
    source: clean(raw?.source || 'playerAbilitiesModule'),

    player: buildPlayerModel(raw?.player),
    evaluator: buildEvaluatorModel(raw?.evaluator),
    team: buildTeamModel(raw?.team),
    club: buildClubModel(raw?.club),

    createdById: clean(raw?.createdById),
    createdByName: clean(raw?.createdByName),

    status: clean(raw?.status || 'sent'),
    createdAt: raw?.createdAt || '',
    sentAt: raw?.sentAt || '',
    openedAt: raw?.openedAt || '',
    submittedAt: raw?.submittedAt || '',
    expiresAt: raw?.expiresAt || '',

    link: clean(raw?.link),
    whatsappText: clean(raw?.whatsappText),
    note: clean(raw?.note),

    active: raw?.active !== false,
    isOpened: Boolean(raw?.isOpened),
    isSubmitted: Boolean(raw?.isSubmitted),
    opensCount: Number(raw?.opensCount || 0),

    meta: {
      allowRoleEdit: raw?.meta?.allowRoleEdit !== false,
      allowGrowthStageEdit: raw?.meta?.allowGrowthStageEdit !== false,
      singleUse: raw?.meta?.singleUse !== false,
      createdBy: clean(raw?.meta?.createdBy),
      activeDomains: normalizeActiveDomains(raw?.meta?.activeDomains),
    },
  }
}
