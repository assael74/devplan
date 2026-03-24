const safe = (v) => (v == null ? '' : String(v))
const trim = (v) => safe(v).trim()

const toText = (v) => trim(v)

const toNullableNumber = (v) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const toBool = (v, fallback = false) => {
  if (v == null) return fallback
  return v === true
}

const normalizeDraft = (team = {}) => {
  return {
    id: team?.id || '',
    teamId: team?.id || '',

    teamName: toText(team?.teamName),
    teamYear: toText(team?.teamYear),

    league: toText(team?.league),
    leagueLevel: toNullableNumber(team?.leagueLevel),
    leaguePosition: toNullableNumber(team?.leaguePosition),

    points: toNullableNumber(team?.points),
    leagueGoalsFor: toNullableNumber(team?.leagueGoalsFor),
    leagueGoalsAgainst: toNullableNumber(team?.leagueGoalsAgainst),

    ifaLink: toText(team?.ifaLink),

    project: toBool(team?.project, false),
    active: team?.active == null ? true : toBool(team?.active, true),
  }
}

export function buildInitialDraft(team) {
  return normalizeDraft(team)
}

export function buildPatch(draft, initial) {
  const nextDraft = normalizeDraft(draft)
  const nextInitial = normalizeDraft(initial)
  const patch = {}

  if (nextDraft.teamName !== nextInitial.teamName) patch.teamName = nextDraft.teamName
  if (nextDraft.teamYear !== nextInitial.teamYear) patch.teamYear = nextDraft.teamYear

  if (nextDraft.league !== nextInitial.league) patch.league = nextDraft.league
  if (nextDraft.leagueLevel !== nextInitial.leagueLevel) patch.leagueLevel = nextDraft.leagueLevel
  if (nextDraft.leaguePosition !== nextInitial.leaguePosition) patch.leaguePosition = nextDraft.leaguePosition

  if (nextDraft.points !== nextInitial.points) patch.points = nextDraft.points
  if (nextDraft.leagueGoalsFor !== nextInitial.leagueGoalsFor) patch.leagueGoalsFor = nextDraft.leagueGoalsFor
  if (nextDraft.leagueGoalsAgainst !== nextInitial.leagueGoalsAgainst) patch.leagueGoalsAgainst = nextDraft.leagueGoalsAgainst

  if (nextDraft.ifaLink !== nextInitial.ifaLink) patch.ifaLink = nextDraft.ifaLink

  if (nextDraft.project !== nextInitial.project) patch.project = nextDraft.project
  if (nextDraft.active !== nextInitial.active) patch.active = nextDraft.active

  return patch
}

export function getIsDirty(draft, initial) {
  return Object.keys(buildPatch(draft, initial)).length > 0
}
