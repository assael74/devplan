// teamProfile/sharedLogic/management/teamManagement.logic.js

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
