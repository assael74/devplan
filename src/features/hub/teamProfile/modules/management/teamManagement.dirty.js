// src/features/hub/teamProfile/modules/management/teamManagement.dirty.js

export function pickTeamManagementDirtySnapshot(model) {
  const m = model || {}
  return {
    active: Boolean(m.active),
    project: Boolean(m.project),
    teamName: String(m.teamName || ''),
    year: String(m.year || ''),
    ifaLink: String(m.ifaLink || ''),
  }
}

export function isTeamManagementDirty(baseModel, draftModel) {
  const a = pickTeamManagementDirtySnapshot(baseModel)
  const b = pickTeamManagementDirtySnapshot(draftModel)

  return (
    a.active !== b.active ||
    a.project !== b.project ||
    a.teamName !== b.teamName ||
    a.year !== b.year ||
    a.ifaLink !== b.ifaLink
  )
}
