// preview/previewDomainCard/domains/team/players/components/drawer/editDrawer.utils.js

export const safe = (value) => (value == null ? '' : String(value).trim())

export const safeArr = (value) => (Array.isArray(value) ? value.filter(Boolean) : [])

export const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)

  if (x.length !== y.length) return false

  for (let index = 0; index < x.length; index += 1) {
    if (x[index] !== y[index]) return false
  }

  return true
}

export const buildPlayerName = (player) =>
  [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ').trim() ||
  player?.playerFullName ||
  player?.fullName ||
  player?.name ||
  'שחקן'

export const buildPlayerMeta = (player) =>
  player?.teamName ||
  player?.team?.teamName ||
  player?.team?.name ||
  'שחקן קבוצה'

export const buildInitialDraft = (player) => {
  const source = player || {}

  return {
    id: source?.id || '',
    name: buildPlayerName(source),
    photo: source?.photo || '',
    teamName: buildPlayerMeta(source),

    playerFirstName: safe(source?.playerFirstName),
    playerLastName: safe(source?.playerLastName),
    playerShortName: safe(source?.playerShortName),
    birthDay: safe(source?.birthDay),
    ifaLink: safe(source?.ifaLink),

    positions: safeArr(source?.positions),
    active: source?.active === true,
    squadRole: source?.squadRole || '',
    type: source?.type || 'noneType',
    projectStatus: source?.projectStatus || '',
    raw: source,
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

  if (!sameArr(draft.positions, initial.positions)) {
    next.positions = draft.positions
  }

  if (draft.active !== initial.active) {
    next.active = draft.active
  }

  if (draft.squadRole !== initial.squadRole) {
    next.squadRole = draft.squadRole
  }

  if (draft.type !== initial.type) {
    next.type = draft.type || 'noneType'
  }

  if (draft.projectStatus !== initial.projectStatus) {
    next.projectStatus = draft.projectStatus || ''
  }

  return next
}

export const getIsDirty = (draft, initial) =>
  draft.playerFirstName !== initial.playerFirstName ||
  draft.playerLastName !== initial.playerLastName ||
  draft.playerShortName !== initial.playerShortName ||
  draft.birthDay !== initial.birthDay ||
  draft.ifaLink !== initial.ifaLink ||
  !sameArr(draft.positions, initial.positions) ||
  draft.active !== initial.active ||
  draft.squadRole !== initial.squadRole ||
  draft.type !== initial.type ||
  draft.projectStatus !== initial.projectStatus
