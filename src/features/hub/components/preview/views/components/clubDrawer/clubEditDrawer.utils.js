// hub/components/preview/views/components/clubDrawer/clubEditDrawer.utils.js

export const safe = (value) => (value == null ? '' : String(value))

export function buildClubEditInitial(club) {
  const c = club || {}

  return {
    clubName: safe(c.clubName),
    ifaLink: safe(c.ifaLink),
    active: Boolean(c.active),
  }
}

export function isClubEditDirty(draft, initial) {
  return (
    draft.clubName !== initial.clubName ||
    draft.ifaLink !== initial.ifaLink ||
    draft.active !== initial.active
  )
}

export function buildClubEditPatch(draft, initial) {
  const patch = {}

  if (draft.clubName !== initial.clubName) patch.clubName = draft.clubName || ''
  if (draft.ifaLink !== initial.ifaLink) patch.ifaLink = draft.ifaLink || ''
  if (draft.active !== initial.active) patch.active = Boolean(draft.active)

  return patch
}
