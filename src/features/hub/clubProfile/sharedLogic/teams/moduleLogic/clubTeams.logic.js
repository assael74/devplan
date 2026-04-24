// features/hub/clubProfile/sharedLogic/teams/moduleLogic/clubTeams.logic.js

const s = (v) => (v == null ? '' : String(v))
const norm = (v) => s(v).trim()
const normLow = (v) => norm(v).toLowerCase()

const toArray = (v) => (Array.isArray(v) ? v : [])

function getTeamId(team) {
  return norm(team?.id || team?.teamId)
}

function getTeamPlayers(team) {
  return toArray(team?.players)
}

function getActivePlayers(team) {
  return getTeamPlayers(team).filter((player) => {
    if (player?.active == null) return true
    return player.active === true
  })
}

function getIsProjectPlayer(player) {
  return (
    player?.isProject === true ||
    player?.type === 'project' ||
    player?.playerType === 'project' ||
    player?.typeId === 'project'
  )
}

function countPlayersForTeam(team) {
  return getActivePlayers(team).length
}

function countKeyPlayersForTeam(team, club) {
  const activePlayers = getActivePlayers(team)

  const teamKeyPlayers = toArray(team?.keyPlayers)
  if (teamKeyPlayers.length) return teamKeyPlayers.length

  const clubKeyPlayers = toArray(club?.keyPlayers)
  if (clubKeyPlayers.length) {
    const teamPlayerIds = new Set(
      activePlayers.map((player) => norm(player?.id || player?.playerId)).filter(Boolean)
    )

    return clubKeyPlayers.filter((player) => {
      const pid = norm(player?.id || player?.playerId)
      return pid && teamPlayerIds.has(pid)
    }).length
  }

  return activePlayers.filter(getIsProjectPlayer).length
}

function getIsProjectTeam(team, club) {
  if (team?.project != null) return team.project === true
  if (team?.isProject != null) return team.isProject === true

  if (toArray(team?.keyPlayers).length) return true

  const clubKeyPlayers = toArray(club?.keyPlayers)
  if (clubKeyPlayers.length) {
    const activePlayerIds = new Set(
      getActivePlayers(team).map((player) => norm(player?.id || player?.playerId)).filter(Boolean)
    )

    const hasClubKeyPlayer = clubKeyPlayers.some((player) => {
      const pid = norm(player?.id || player?.playerId)
      return pid && activePlayerIds.has(pid)
    })

    if (hasClubKeyPlayer) return true
  }

  return getActivePlayers(team).some(getIsProjectPlayer)
}

function buildSearchText(row) {
  return normLow([
    row?.teamName,
    row?.teamYear,
    row?.league,
    row?.leagueLevel,
    row?.leaguePosition,
    row?.points,
  ].filter(Boolean).join(' '))
}

export function buildClubTeamRows({ club }) {
  const teams = toArray(club?.teams)

  const rows = teams
    .map((team) => {
      const id = getTeamId(team)
      if (!id) return null

      const playersCount = countPlayersForTeam(team)
      const keyPlayersCount = countKeyPlayersForTeam(team, club)
      const isProject = getIsProjectTeam(team, club)

      const row = {
        id,
        teamId: id,

        teamName: norm(team?.teamName || team?.name) || '—',
        teamYear: norm(team?.teamYear || team?.year) || '—',
        active: team?.active == null ? true : team.active === true,

        league: norm(team?.league || team?.leagueName) || '',
        leagueLevel: team?.leagueLevel ?? null,
        leaguePosition: team?.leaguePosition ?? null,
        points: team?.points ?? null,
        leagueGoalsFor: team?.leagueGoalsFor ?? null,
        leagueGoalsAgainst: team?.leagueGoalsAgainst ?? null,

        playersCount,
        keyPlayersCount,
        isProject,

        raw: team,
        team,
      }

      return {
        ...row,
        searchText: buildSearchText(row),
      }
    })
    .filter(Boolean)

  const summary = {
    teamsTotal: rows.length,
    activeTeamsTotal: rows.filter((row) => row.active === true).length,
    projectTeamsTotal: rows.filter((row) => row.isProject === true).length,
    playersTotal: rows.reduce((sum, row) => sum + (row.playersCount || 0), 0),
    keyPlayersTotal: rows.reduce((sum, row) => sum + (row.keyPlayersCount || 0), 0),
  }

  return { rows, summary }
}
