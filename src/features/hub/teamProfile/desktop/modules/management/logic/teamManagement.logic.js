// src/features/hub/teamProfile/modules/management/teamManagement.logic.js

export function buildTeamManagementModel(team) {
  const t = team || {}

  return {
    teamName: String(t.teamName || ''),
    ifaLink: String(t.ifaLink || ''),
    active: Boolean(t.active),
    project: t.project,
    teamYear: String(t.teamYear || ''),
    league: String(t.league || ''),
    leagueLevel: String(t.leagueLevel || ''),
    leaguePosition: String(t.leaguePosition || ''),
    points: String(t.points || ''),
    leagueGoalsFor: String(t.leagueGoalsFor || ''),
    leagueGoalsAgainst: String(t.leagueGoalsAgainst || ''),
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
  if (p.league !== n.league) patch.league = n.league
  if (p.leagueLevel !== n.leagueLevel) patch.leagueLevel = n.leagueLevel
  if (p.leaguePosition !== n.leaguePosition) patch.leaguePosition = n.leaguePosition
  if (p.points !== n.points) patch.points = n.points
  if (p.leagueGoalsFor !== n.leagueGoalsFor) patch.leagueGoalsFor = n.leagueGoalsFor
  if (p.leagueGoalsAgainst !== n.leagueGoalsAgainst) patch.leagueGoalsAgainst = n.leagueGoalsAgainst

  return patch
}
