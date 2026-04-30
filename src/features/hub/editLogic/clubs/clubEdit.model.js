// features/hub/editLogic/clubs/clubEdit.model.js

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

const getId = (source = {}) => {
  return clean(source?.id || source?.clubId)
}

const getSource = (club = {}) => {
  if (!club || typeof club !== 'object') return {}

  return {
    ...club?.raw,
    ...club?.club,
    ...club,
  }
}

const getBool = (value, fallback = false) => {
  if (value == null) return fallback
  return value === true
}

function addIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = clean(draft[key])
  }
}

function addBoolIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = draft[key] === true
  }
}

export function buildClubEditInitial(club = {}) {
  const source = getSource(club)
  const id = getId(source)

  return {
    id,
    clubId: id,
    raw: source,

    clubName: clean(source?.clubName || source?.name),
    ifaLink: clean(source?.ifaLink),

    active: getBool(source?.active, true),
  }
}

export function isClubEditDirty(draft = {}, initial = {}) {
  return (
    draft.clubName !== initial.clubName ||
    draft.ifaLink !== initial.ifaLink ||
    draft.active !== initial.active
  )
}

export function buildClubEditPatch(draft = {}, initial = {}) {
  const next = {}

  addIfChanged(next, draft, initial, 'clubName')
  addIfChanged(next, draft, initial, 'ifaLink')

  addBoolIfChanged(next, draft, initial, 'active')

  return next
}
