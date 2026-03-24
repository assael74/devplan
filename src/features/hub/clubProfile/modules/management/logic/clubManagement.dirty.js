// src/features/hub/clubProfile/modules/management/clubManagement.dirty.js

export function pickClubManagementDirtySnapshot(model) {
  const m = model || {}
  return {
    active: Boolean(m.active),
    clubName: String(m.clubName || ''),
    ifaLink: String(m.ifaLink || ''),
  }
}

export function isClubManagementDirty(baseModel, draftModel) {
  const a = pickClubManagementDirtySnapshot(baseModel)
  const b = pickClubManagementDirtySnapshot(draftModel)

  return (
    a.active !== b.active ||
    a.clubName !== b.clubName ||
    a.ifaLink !== b.ifaLink
  )
}
