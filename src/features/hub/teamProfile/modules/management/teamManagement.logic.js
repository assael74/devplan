// src/features/hub/teamProfile/modules/management/teamManagement.logic.js

export function buildTeamManagementModel(team) {
  const t = team || {}

  return {
    teamName: String(t.teamName || ''),
    ifaLink: String(t.ifaLink || ''),
    active: Boolean(t.active),
    project: t.project,
    teamYear: String(t.teamYear || ''),
  }
}

export function buildTeamManagementPatch(prevModel, nextModel) {
  const p = prevModel || {}
  const n = nextModel || {}
  const patch = {}

  if (p.teamName !== n.teamName) patch.teamName = n.teamName
  if (p.ifaLink !== n.ifaLink) patch.ifaLink = n.ifaLink
  if (p.active !== n.active) patch.active = n.active
  if (p.teamYear !== n.teamYear) patch.teamYear = n.teamYear
  if (p.project !== n.project) patch.project = n.project

  return patch
}
