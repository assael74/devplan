// preview/PreviewDomainCard/domains/club/teams/clubTeams.domain.logic.js

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

function getProjectPlayers(team) {
  return getTeamPlayers(team).filter(getIsProjectPlayer)
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

  return activePlayers.filter((player) => {
    return (
      player?.squadRole === 'key' ||
      player?.isKey === true
    )
  }).length
}

function countProjectPlayersForTeam(team) {
  return getProjectPlayers(team).length
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
  return normLow(
    [
      row?.teamName,
      row?.teamYear,
      row?.league,
      row?.leagueLevel,
      row?.leaguePosition,
      row?.points,
    ]
      .filter(Boolean)
      .join(' ')
  )
}

function matchFilter(value, expected) {
  if (expected === 'all') return true
  if (expected === 'yes') return value === true
  if (expected === 'no') return value === false
  return true
}

export function buildClubTeamRows(club, filters = {}) {
  const teams = toArray(club?.teams)

  const baseRows = teams
    .map((team) => {
      const id = getTeamId(team)
      if (!id) return null

      const playersCount = countPlayersForTeam(team)
      const keyPlayersCount = countKeyPlayersForTeam(team, club)
      const projectPlayersCount = countProjectPlayersForTeam(team)
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

        isProject,
        playersCount,
        keyPlayersCount,
        projectPlayersCount,

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
    teamsTotal: baseRows.length,
    activeTeamsTotal: baseRows.filter((row) => row.active === true).length,
    projectTeamsTotal: baseRows.filter((row) => row.isProject === true).length,
    playersTotal: baseRows.reduce((sum, row) => sum + (row.playersCount || 0), 0),
    keyPlayersTotal: baseRows.reduce((sum, row) => sum + (row.keyPlayersCount || 0), 0),
    projectPlayersTotal: baseRows.reduce((sum, row) => sum + (row.projectPlayersCount || 0), 0),
  }

  const yearOptions = Array.from(
    new Set(baseRows.map((row) => norm(row.teamYear)).filter(Boolean).filter((v) => v !== '—'))
  ).sort((a, b) => Number(b) - Number(a))

  const options = {
    years: yearOptions.map((year) => ({
      value: year,
      label: year,
    })),
  }

  const q = normLow(filters?.q)
  const year = norm(filters?.year || 'all')
  const active = norm(filters?.active || 'all')
  const project = norm(filters?.project || 'all')

  const rows = baseRows.filter((row) => {
    if (q && !row.searchText.includes(q)) return false
    if (year !== 'all' && norm(row.teamYear) !== year) return false
    if (!matchFilter(row.active, active)) return false
    if (!matchFilter(row.isProject, project)) return false
    return true
  })

  return {
    rows,
    summary,
    options,
  }
}
