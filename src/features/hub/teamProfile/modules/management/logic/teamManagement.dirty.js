// src/features/hub/teamProfile/modules/management/teamManagement.dirty.js

export function pickTeamManagementDirtySnapshot(model) {
  const m = model || {}
  return {
    active: Boolean(m.active),
    project: Boolean(m.project),
    teamName: String(m.teamName || ''),
    year: String(m.year || ''),
    ifaLink: String(m.ifaLink || ''),
    league: String(m.league || ''),
    leagueLevel: String(m.leagueLevel || ''),
    leaguePos: String(m.leaguePos || ''),
    leaguePoints: String(m.leaguePoints || ''),
    goalsFor: String(m.goalsFor || ''),
    goalsAgainst: String(m.goalsAgainst || ''),
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
    a.ifaLink !== b.ifaLink ||
    a.league !== b.league ||
    a.leagueLevel !== b.leagueLevel ||
    a.leaguePos !== b.leaguePos ||
    a.leaguePoints !== b.leaguePoints ||
    a.goalsFor !== b.goalsFor ||
    a.goalsAgainst !== b.goalsAgainst
  )
}
