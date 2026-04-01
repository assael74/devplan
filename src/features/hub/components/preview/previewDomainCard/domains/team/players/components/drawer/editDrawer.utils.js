export const safe = (v) => (v == null ? '' : String(v))

export const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean) : [])

export const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)

  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i += 1) {
    if (x[i] !== y[i]) return false
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
  const p = player || {}

  return {
    id: p?.id || '',
    name: buildPlayerName(p),
    photo: p?.photo || '',
    teamName: buildPlayerMeta(p),
    positions: safeArr(p?.positions),
    active: p?.active === true,
    squadRole: p?.squadRole || '',
    type: p?.type,
    projectStatus: p?.projectStatus || '',
    raw: p,
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
