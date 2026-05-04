// features/hub/editLogic/teams/teamEdit.model.js

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

const getId = (source = {}) => {
  return clean(source?.id || source?.teamId)
}

const getSource = (team = {}) => {
  if (!team || typeof team !== 'object') return {}

  return {
    ...team?.raw,
    ...team?.team,
    ...team,
  }
}

const getBool = (value, fallback = false) => {
  if (value == null) return fallback
  return value === true
}

function addIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = clean(draft[key])
  }
}

function addBoolIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = draft[key] === true
  }
}

export function buildTeamEditInitial(team = {}) {
  const source = getSource(team)
  const id = getId(source)

  return {
    id,
    teamId: id,
    raw: source,

    teamName: clean(source?.teamName || source?.name),
    ifaLink: clean(source?.ifaLink),

    active: getBool(source?.active, true),
    project: getBool(source?.project, false),

    teamYear: clean(source?.teamYear || source?.year),

    league: clean(source?.league || source?.leagueName),
    leagueLevel: clean(source?.leagueLevel),
    leaguePosition: clean(source?.leaguePosition),
    leagueRound: clean(source?.leagueRound),
    leagueNumGames: clean(source?.leagueNumGames),

    points: clean(source?.points),
    leagueGoalsFor: clean(source?.leagueGoalsFor),
    leagueGoalsAgainst: clean(source?.leagueGoalsAgainst),

    targetPosition: clean(source?.targetPosition),
    targetPoints: clean(source?.targetPoints),
    targetSuccessRate: clean(source?.targetSuccessRate),
    targetGoalsFor: clean(source?.targetGoalsFor),
    targetGoalsAgainst: clean(source?.targetGoalsAgainst),
  }
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
    draft.leagueRound !== initial.leagueRound ||
    draft.leagueNumGames !== initial.leagueNumGames ||
    draft.points !== initial.points ||
    draft.leagueGoalsFor !== initial.leagueGoalsFor ||
    draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst ||
    draft.targetPosition !== initial.targetPosition ||
    draft.targetPoints !== initial.targetPoints ||
    draft.targetSuccessRate !== initial.targetSuccessRate ||
    draft.targetGoalsFor !== initial.targetGoalsFor ||
    draft.targetGoalsAgainst !== initial.targetGoalsAgainst
  )
}

export function buildTeamEditPatch(draft = {}, initial = {}) {
  const next = {}

  addIfChanged(next, draft, initial, 'teamName')
  addIfChanged(next, draft, initial, 'ifaLink')

  addBoolIfChanged(next, draft, initial, 'active')
  addBoolIfChanged(next, draft, initial, 'project')

  addIfChanged(next, draft, initial, 'teamYear')

  addIfChanged(next, draft, initial, 'league')
  addIfChanged(next, draft, initial, 'leagueLevel')
  addIfChanged(next, draft, initial, 'leaguePosition')
  addIfChanged(next, draft, initial, 'leagueRound')
  addIfChanged(next, draft, initial, 'leagueNumGames')

  addIfChanged(next, draft, initial, 'points')
  addIfChanged(next, draft, initial, 'leagueGoalsFor')
  addIfChanged(next, draft, initial, 'leagueGoalsAgainst')

  addIfChanged(next, draft, initial, 'targetPosition')
  addIfChanged(next, draft, initial, 'targetPoints')
  addIfChanged(next, draft, initial, 'targetSuccessRate')
  addIfChanged(next, draft, initial, 'targetGoalsFor')
  addIfChanged(next, draft, initial, 'targetGoalsAgainst')

  return next
}
