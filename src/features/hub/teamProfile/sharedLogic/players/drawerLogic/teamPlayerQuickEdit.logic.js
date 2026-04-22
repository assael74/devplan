// teamProfile/sharedLogic/players/drawerLogic/teamPlayerQuickEdit.logic.js

export const safe = (value) => (value == null ? '' : String(value))

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
    positions: safeArr(source?.positions),
    active: source?.active === true,
    squadRole: source?.squadRole || '',
    type: source?.type,
    projectStatus: source?.projectStatus || '',
    raw: source,
  }
}

export const buildPatch = (draft, initial) => {
  const next = {}

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
    next.type = draft.type
  }

  if (draft.projectStatus !== initial.projectStatus) {
    next.projectStatus = draft.projectStatus || ''
  }

  return next
}

export const getIsDirty = (draft, initial) =>
  !sameArr(draft.positions, initial.positions) ||
  draft.active !== initial.active ||
  draft.squadRole !== initial.squadRole ||
  draft.type !== initial.type ||
  draft.projectStatus !== initial.projectStatus
