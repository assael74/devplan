// clubProfile/modules/teams/clubTeams.logic.js

const s = (v) => (v == null ? '' : String(v))
const norm = (v) => s(v).trim()

const toIdList = (v) => {
  if (Array.isArray(v)) return v.map(norm).filter(Boolean)
  if (v && typeof v === 'object') return Object.keys(v).map(norm).filter(Boolean) // אם זה map
  const one = norm(v)
  return one ? [one] : []
}

const pickTeamId = (pack) => norm(pack?.teamId || pack?.team?.id || pack?.id)

const pickTeam = (pack, teamsList) => {
  const id = pickTeamId(pack)
  if (!id) return null
  return (teamsList || []).find((t) => norm(t?.id) === id) || null
}

const countPlayersForTeam = (playersList, teamId) => {
  const tid = norm(teamId)
  if (!tid) return 0
  return (playersList || []).filter((p) => norm(p?.teamId) === tid && (p?.active == null ? true : !!p.active)).length
}

const countKeyPlayersForTeam = ({ club, team, playersList, teamId }) => {
  const tid = norm(teamId)
  if (!tid) return 0

  // Priority: team.keyPlayers
  const teamKey = Array.isArray(team?.keyPlayers) ? team.keyPlayers : []
  if (teamKey.length) return teamKey.length

  // Fallback: club.keyPlayers filtered by teamId (רק שייכים לקבוצה)
  const clubKey = Array.isArray(club?.keyPlayers) ? club.keyPlayers : []
  if (!clubKey.length) return 0

  const clubKeySet = new Set(clubKey.map((p) => norm(p?.id || p?.playerId)).filter(Boolean))
  const playersInTeam = (playersList || []).filter(
    (p) => norm(p?.teamId) === tid && (p?.active == null ? true : !!p.active)
  )

  let c = 0
  for (const p of playersInTeam) {
    const pid = norm(p?.id || p?.playerId)
    if (pid && clubKeySet.has(pid)) c++
  }
  return c
}

export function buildClubTeamRows({ club, context }) {
  const base = Array.isArray(club?.teams) ? club.teams : []
  const teamsList = context?.teamsList || []
  const playersList = context?.playersList || []

  const rows = base
    .map((pack) => {
      const team = pickTeam(pack, teamsList)
      const id = pickTeamId(pack)
      if (!id) return null

      const playersCount = countPlayersForTeam(playersList, id)
      const keyPlayersCount = countKeyPlayersForTeam({ club, team, playersList, teamId: id })

      return {
        id,
        teamId: id,

        teamName: norm(pack?.teamName || team?.teamName || team?.name) || '—',
        teamYear: norm(pack?.teamYear || team?.teamYear || pack?.year || team?.year) || '—',
        active: pack?.active != null ? !!pack.active : team?.active != null ? !!team.active : true,

        leagueName: norm(pack?.leagueName || team?.leagueName || pack?.league || team?.league) || '—',
        leaguePosition: pack?.leaguePosition ?? team?.leaguePosition ?? null,
        goalsFor: pack?.goalsFor ?? team?.goalsFor ?? null,
        goalsAgainst: pack?.goalsAgainst ?? team?.goalsAgainst ?? null,

        playersCount,
        keyPlayersCount,

        raw: pack,
        team,
      }
    })
    .filter(Boolean)

  const summary = {
    teamsTotal: rows.length,
    playersTotal: rows.reduce((a, r) => a + (r.playersCount || 0), 0),
    keyPlayersTotal: rows.reduce((a, r) => a + (r.keyPlayersCount || 0), 0),
  }

  return { rows, summary }
}
