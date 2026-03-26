// src/features/hub/teamProfile/modules/management/teamManagement.dirty.js

export function pickTeamManagementDirtySnapshot(model) {
  const m = model || {}
  return {
    active: Boolean(m.active),
    project: Boolean(m.project),
    teamName: String(m.teamName || ''),
    teamYear: String(m.teamYear || ''),
    ifaLink: String(m.ifaLink || ''),
    league: String(m.league || ''),
    leagueLevel: String(m.leagueLevel || ''),
    leaguePosition: String(m.leaguePosition || ''),
    points: String(m.points || ''),
    leagueGoalsFor: String(m.leagueGoalsFor || ''),
    leagueGoalsAgainst: String(m.leagueGoalsAgainst || ''),
  }
}

export function isTeamManagementDirty(baseModel, draftModel) {
  const a = pickTeamManagementDirtySnapshot(baseModel)
  const b = pickTeamManagementDirtySnapshot(draftModel)

  return (
    a.active !== b.active ||
    a.project !== b.project ||
    a.teamName !== b.teamName ||
    a.teamYear !== b.teamYear ||
    a.ifaLink !== b.ifaLink ||
    a.league !== b.league ||
    a.leagueLevel !== b.leagueLevel ||
    a.leaguePosition !== b.leaguePosition ||
    a.points !== b.points ||
    a.leagueGoalsFor !== b.leagueGoalsFor ||
    a.leagueGoalsAgainst !== b.leagueGoalsAgainst
  )
}
