// preview/previewDomainCard/domains/club/players/components/drawer/editDrawer.utils.js

export const safe = (value) => (value == null ? '' : String(value).trim())

export const buildInitialDraft = (player) => {
  const source = player || {}

  return {
    id: source?.id || source?.playerId || '',
    raw: source,

    playerFirstName: safe(source?.playerFirstName),
    playerLastName: safe(source?.playerLastName),
    playerShortName: safe(source?.playerShortName),
    birthDay: safe(source?.birthDay),
    ifaLink: safe(source?.ifaLink),

    active: source?.active === true,
    squadRole: safe(source?.squadRole),
    type: safe(source?.type || 'noneType'),
    projectStatus: safe(source?.projectStatus),
  }
}

export const buildPatch = (draft, initial) => {
  const next = {}

  if (draft.playerFirstName !== initial.playerFirstName) {
    next.playerFirstName = safe(draft.playerFirstName)
  }

  if (draft.playerLastName !== initial.playerLastName) {
    next.playerLastName = safe(draft.playerLastName)
  }

  if (draft.playerShortName !== initial.playerShortName) {
    next.playerShortName = safe(draft.playerShortName)
  }

  if (draft.birthDay !== initial.birthDay) {
    next.birthDay = safe(draft.birthDay)
  }

  if (draft.ifaLink !== initial.ifaLink) {
    next.ifaLink = safe(draft.ifaLink)
  }

  if (draft.active !== initial.active) {
    next.active = draft.active === true
  }

  if (draft.squadRole !== initial.squadRole) {
    next.squadRole = safe(draft.squadRole)
  }

  if (draft.type !== initial.type) {
    next.type = safe(draft.type || 'noneType')
  }

  if (draft.projectStatus !== initial.projectStatus) {
    next.projectStatus = safe(draft.projectStatus)
  }

  return next
}

export const getIsDirty = (draft, initial) =>
  draft.playerFirstName !== initial.playerFirstName ||
  draft.playerLastName !== initial.playerLastName ||
  draft.playerShortName !== initial.playerShortName ||
  draft.birthDay !== initial.birthDay ||
  draft.ifaLink !== initial.ifaLink ||
  draft.active !== initial.active ||
  draft.squadRole !== initial.squadRole ||
  draft.type !== initial.type ||
  draft.projectStatus !== initial.projectStatus
