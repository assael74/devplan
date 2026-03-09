// src/features/hub/clubProfile/modules/players/clubPlayers.logic.js

const s = (v) => (v == null ? '' : String(v))
const norm = (v) => s(v).trim()

const asNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const pickId = (p) => norm(p?.id || p?.playerId)
const pickTeamId = (p) => norm(p?.teamId || p?.playerTeam?.teamId || p?.team?.id)

const pickFullName = (p) =>
  norm([p?.playerFirstName, p?.playerLastName].filter(Boolean).join(' ')) || norm(p?.fullName) || '—'

const pickPotential = (p) => {
  // פוטנציאל/רמה: תומך בכמה שמות אפשריים בלי לשבור
  return (
    asNum(p?.potential) ??
    asNum(p?.potentialScore) ??
    asNum(p?.level) ??
    asNum(p?.rating) ??
    null
  )
}

const pickMinutes = (p) =>
  asNum(p?.timePlayed) ??
  asNum(p?.totalMinutes) ??
  asNum(p?.minutes) ??
  asNum(p?.timePlay) ??
  null

const pickGoals = (p) =>
  asNum(p?.goals) ??
  asNum(p?.gf) ??
  asNum(p?.stats?.goals) ??
  asNum(p?.performance?.goals) ??
  null

const pickAssists = (p) =>
  asNum(p?.assists) ??
  asNum(p?.ast) ??
  asNum(p?.stats?.assists) ??
  asNum(p?.performance?.assists) ??
  null

const pickTeamName = (team) => norm(team?.teamName || team?.name) || '—'
const pickTeamYear = (team) => norm(team?.teamYear || team?.year) || '—'

export function buildClubPlayerRows({ club, context, mode = 'key' }) {
  const teamsList = context?.teamsList || []
  const playersList = context?.playersList || []

  const source = mode === 'all'
    ? playersList
    : Array.isArray(club?.keyPlayers) ? club.keyPlayers : []

  const rows = (source || [])
    .map((p) => {
      const id = pickId(p)
      if (!id) return null

      const teamId = pickTeamId(p)
      const team = teamId ? teamsList.find((t) => norm(t?.id) === teamId) : null

      const minutes = pickMinutes(p)
      const goals = pickGoals(p)
      const assists = pickAssists(p)

      return {
        id,
        playerId: id,
        fullName: pickFullName(p),
        photo: p?.photo || null,
        active: p?.active == null ? true : !!p.active,

        teamId,
        teamName: pickTeamName(team),
        teamYear: pickTeamYear(team),

        potential: pickPotential(p),
        minutes,
        goals,
        assists,

        raw: p,
        team,
      }
    })
    .filter(Boolean)

  const summary = {
    total: rows.length,
    active: rows.filter((r) => r.active).length,
    nonActive: rows.filter((r) => !r.active).length,

    minutesTotal: rows.reduce((a, r) => a + (r.minutes || 0), 0),
    goalsTotal: rows.reduce((a, r) => a + (r.goals || 0), 0),
    assistsTotal: rows.reduce((a, r) => a + (r.assists || 0), 0),
  }

  return { rows, summary }
}
