// preview/previewDomainCard/domains/club/teams/components/drawer/editDrawer.utils.js

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

export function buildTeamEditInitial(team) {
  const source = team || {}

  return {
    id: source?.id || '',
    raw: source,

    teamName: clean(source?.teamName),
    ifaLink: clean(source?.ifaLink),
    active: source?.active === true,
    project: source?.project === true,
    teamYear: clean(source?.teamYear),
    league: clean(source?.league),
    leagueLevel: clean(source?.leagueLevel),
    leaguePosition: clean(source?.leaguePosition),
    points: clean(source?.points),
    leagueGoalsFor: clean(source?.leagueGoalsFor),
    leagueGoalsAgainst: clean(source?.leagueGoalsAgainst),
  }
}

export function isTeamEditDirty(draft, initial) {
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

export function buildTeamEditPatch(draft, initial) {
  const next = {}

  if (draft.teamName !== initial.teamName) next.teamName = clean(draft.teamName)
  if (draft.ifaLink !== initial.ifaLink) next.ifaLink = clean(draft.ifaLink)
  if (draft.active !== initial.active) next.active = draft.active === true
  if (draft.project !== initial.project) next.project = draft.project === true
  if (draft.teamYear !== initial.teamYear) next.teamYear = clean(draft.teamYear)
  if (draft.league !== initial.league) next.league = clean(draft.league)
  if (draft.leagueLevel !== initial.leagueLevel) next.leagueLevel = clean(draft.leagueLevel)
  if (draft.leaguePosition !== initial.leaguePosition) next.leaguePosition = clean(draft.leaguePosition)
  if (draft.points !== initial.points) next.points = clean(draft.points)
  if (draft.leagueGoalsFor !== initial.leagueGoalsFor) next.leagueGoalsFor = clean(draft.leagueGoalsFor)
  if (draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst) next.leagueGoalsAgainst = clean(draft.leagueGoalsAgainst)

  return next
}
