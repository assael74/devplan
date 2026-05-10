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

const normalizeTargetPositionMode = (value) => {
  const mode = clean(value)

  if (mode === 'exact') return 'exact'
  if (mode === 'range') return 'range'

  return ''
}

const normalizeTargetPosition = (value) => {
  return clean(value)
}

const normalizeTargetProfileId = (value) => {
  return clean(value)
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

function addTargetIfChanged(next, draft, initial) {
  if (draft.targetPositionMode !== initial.targetPositionMode) {
    next.targetPositionMode = normalizeTargetPositionMode(draft.targetPositionMode)
  }

  if (draft.targetPosition !== initial.targetPosition) {
    next.targetPosition = normalizeTargetPosition(draft.targetPosition)
  }

  if (draft.targetProfileId !== initial.targetProfileId) {
    next.targetProfileId = normalizeTargetProfileId(draft.targetProfileId)
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

    targetPositionMode: normalizeTargetPositionMode(source?.targetPositionMode),
    targetPosition: normalizeTargetPosition(source?.targetPosition),
    targetProfileId: normalizeTargetProfileId(source?.targetProfileId),

    points: clean(source?.points),
    leagueGoalsFor: clean(source?.leagueGoalsFor),
    leagueGoalsAgainst: clean(source?.leagueGoalsAgainst),
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
    draft.targetPositionMode !== initial.targetPositionMode ||
    draft.targetPosition !== initial.targetPosition ||
    draft.targetProfileId !== initial.targetProfileId ||
    draft.points !== initial.points ||
    draft.leagueGoalsFor !== initial.leagueGoalsFor ||
    draft.leagueGoalsAgainst !== initial.leagueGoalsAgainst
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

  addTargetIfChanged(next, draft, initial)

  addIfChanged(next, draft, initial, 'points')
  addIfChanged(next, draft, initial, 'leagueGoalsFor')
  addIfChanged(next, draft, initial, 'leagueGoalsAgainst')

  return next
}
