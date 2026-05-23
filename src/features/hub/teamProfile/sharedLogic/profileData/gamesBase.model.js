// src/features/hub/teamProfile/sharedLogic/profileData/gamesBase.model.js

const emptyArray = []

const LEAGUE_GAME_TYPE = 'league'
const PLAYED_STATUS = 'played'

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameId = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameId ||
      game?.id ||
      game?.gameId ||
      ''
  )
}

const getGameType = row => {
  const game = getGameObject(row)

  return asText(
    row?.type ||
      row?.gameType ||
      game?.type ||
      game?.gameType ||
      ''
  ).toLowerCase()
}

const getGameStatus = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameStatus ||
      game?.gameStatus ||
      row?.status ||
      game?.status ||
      ''
  ).toLowerCase()
}

const getGameTime = row => {
  const game = getGameObject(row)
  const value =
    row?.gameDate ||
    game?.gameDate ||
    row?.date ||
    game?.date ||
    ''

  const time = new Date(value).getTime()

  return Number.isFinite(time) ? time : 0
}

const sortGamesAsc = games => {
  return [...games].sort((a, b) => {
    return getGameTime(a) - getGameTime(b)
  })
}

const buildById = games => {
  return games.reduce((acc, row) => {
    const id = getGameId(row)

    if (id) {
      acc[id] = row
    }

    return acc
  }, {})
}

const isLeagueGame = row => {
  const type = getGameType(row)

  return !type || type === LEAGUE_GAME_TYPE
}

const isPlayedGame = row => {
  const status = getGameStatus(row)

  return !status || status === PLAYED_STATUS
}

export const buildTeamGamesBase = team => {
  const allGames = Array.isArray(team?.teamGames)
    ? sortGamesAsc(team.teamGames)
    : emptyArray

  const leagueGames = allGames.filter(isLeagueGame)
  const playedLeagueGames = leagueGames.filter(isPlayedGame)

  const plannedLeagueGames = leagueGames.filter(row => {
    return !isPlayedGame(row)
  })

  return {
    allGames,
    leagueGames,
    playedLeagueGames,
    plannedLeagueGames,

    byId: buildById(allGames),
    leagueById: buildById(leagueGames),
    playedLeagueById: buildById(playedLeagueGames),

    counts: {
      all: allGames.length,
      league: leagueGames.length,
      playedLeague: playedLeagueGames.length,
      plannedLeague: plannedLeagueGames.length,
    },
  }
}
