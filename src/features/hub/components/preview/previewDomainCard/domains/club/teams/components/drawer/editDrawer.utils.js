export const safe = (v) => (v == null ? '' : String(v))

export const safeArr = (v) => (Array.isArray(v) ? v.filter(Boolean) : [])

export const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)

  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i += 1) {
    if (x[i] !== y[i]) return false
  }
  return true
}

export function buildTeamEditInitial(team) {
  const t = team || {}

  return {
    teamName: safe(t.teamName),
    ifaLink: safe(t.ifaLink),
    active: Boolean(t.active),
    project: t.project ?? false,
    teamYear: safe(t.teamYear),
    league: safe(t.league),
    leagueLevel: safe(t.leagueLevel),
    leaguePosition: safe(t.leaguePosition),
    points: safe(t.points),
    leagueGoalsFor: safe(t.leagueGoalsFor),
    leagueGoalsAgainst: safe(t.leagueGoalsAgainst),
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

  if (draft.teamName !== initial.teamName) next.teamName = draft.teamName || ''
  if (draft.ifaLink !== initial.ifaLink) next.ifaLink = draft.ifaLink || ''
  if (draft.active !== initial.active) next.active = Boolean(draft.active)
  if (draft.project !== initial.project) next.project = draft.project
  if (draft.teamYear !== initial.teamYear) next.teamYear = draft.teamYear || ''
  if (draft.league !== initial.league) next.league = draft.league || ''
  if (draft.leagueLevel !== initial.leagueLevel) next.leagueLevel = draft.leagueLevel || ''
  if (draft.leaguePosition !== initial.leaguePosition) next.leaguePosition = draft.leaguePosition || ''
  if (draft.points !== initial.points) next.points = draft.points || ''
  if (draft.leagueGoalsFor !== initial.leagueGoalsFor) next.leagueGoalsFor = draft.leagueGoalsFor || ''
  if (draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst) next.leagueGoalsAgainst = draft.leagueGoalsAgainst || ''

  return next
}
