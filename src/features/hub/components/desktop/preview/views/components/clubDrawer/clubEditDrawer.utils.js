// hub/components/desktop/preview/views/components/clubDrawer/clubEditDrawer.utils.js

export const safe = (value) => (value == null ? '' : String(value))

export function buildClubEditInitial(club = {}) {
  return {
    id: safe(club?.id),
    clubName: safe(club?.clubName),
    ifaLink: safe(club?.ifaLink),
    active: Boolean(club?.active),
    raw: club || {},
  }
}

export function getClubEditFieldErrors(draft = {}) {
  const clubName = safe(draft?.clubName).trim()

  return {
    clubName: !clubName,
  }
}

export function getIsClubEditValid(draft = {}) {
  return !Object.values(getClubEditFieldErrors(draft)).some(Boolean)
}

export function isClubEditDirty(draft = {}, initial = {}) {
  return (
    draft.clubName !== initial.clubName ||
    draft.ifaLink !== initial.ifaLink ||
    draft.active !== initial.active
  )
}

export function buildClubEditPatch(draft = {}, initial = {}) {
  const patch = {}

  if (draft.clubName !== initial.clubName) patch.clubName = draft.clubName || ''
  if (draft.ifaLink !== initial.ifaLink) patch.ifaLink = draft.ifaLink || ''
  if (draft.active !== initial.active) patch.active = Boolean(draft.active)

  return patch
}
