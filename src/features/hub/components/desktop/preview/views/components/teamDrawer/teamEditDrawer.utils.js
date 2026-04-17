// hub/components/desktop/preview/views/components/teamDrawer/teamEditDrawer.utils.js

export const safe = (v) => (v == null ? '' : String(v))

export function buildTeamEditInitial(team = {}) {
  return {
    id: safe(team?.id),
    teamName: safe(team?.teamName),
    ifaLink: safe(team?.ifaLink),
    active: Boolean(team?.active),
    project: team?.project ?? false,
    teamYear: safe(team?.teamYear),
    league: safe(team?.league),
    leagueLevel: safe(team?.leagueLevel),
    leaguePosition: safe(team?.leaguePosition),
    points: safe(team?.points),
    leagueGoalsFor: safe(team?.leagueGoalsFor),
    leagueGoalsAgainst: safe(team?.leagueGoalsAgainst),
    raw: team || {},
  }
}

export function getTeamEditFieldErrors(draft = {}) {
  const teamName = safe(draft?.teamName).trim()

  return {
    teamName: !teamName,
  }
}

export function getIsTeamEditValid(draft = {}) {
  return !Object.values(getTeamEditFieldErrors(draft)).some(Boolean)
}

export function isTeamEditDirty(draft = {}, initial = {}) {
  return (
    draft.teamName !== initial.teamName ||
    draft.ifaLink !== initial.ifaLink ||
    draft.active !== initial.active ||
    draft.project !== initial.project ||
    draft.teamYear !== initial.teamYear ||
    draft.league !== initial.league ||
    draft.leagueLevel !== initial.leagueLevel ||
    draft.leaguePosition !== initial.leaguePosition ||
    draft.points !== initial.points ||
    draft.leagueGoalsFor !== initial.leagueGoalsFor ||
    draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst
  )
}

export function buildTeamEditPatch(draft = {}, initial = {}) {
  const next = {}

  if (draft.teamName !== initial.teamName) next.teamName = draft.teamName || ''
  if (draft.ifaLink !== initial.ifaLink) next.ifaLink = draft.ifaLink || ''
  if (draft.active !== initial.active) next.active = Boolean(draft.active)
  if (draft.project !== initial.project) next.project = Boolean(draft.project)
  if (draft.teamYear !== initial.teamYear) next.teamYear = draft.teamYear || ''
  if (draft.league !== initial.league) next.league = draft.league || ''
  if (draft.leagueLevel !== initial.leagueLevel) next.leagueLevel = draft.leagueLevel || ''
  if (draft.leaguePosition !== initial.leaguePosition) next.leaguePosition = draft.leaguePosition || ''
  if (draft.points !== initial.points) next.points = draft.points || ''
  if (draft.leagueGoalsFor !== initial.leagueGoalsFor) next.leagueGoalsFor = draft.leagueGoalsFor || ''
  if (draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst) next.leagueGoalsAgainst = draft.leagueGoalsAgainst || ''

  return next
}
