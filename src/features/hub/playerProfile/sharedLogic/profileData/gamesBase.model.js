// src/features/hub/playerProfile/sharedLogic/profileData/gamesBase.model.js

const emptyArray = []

const LEAGUE_GAME_TYPE = 'league'
const PLAYED_STATUS = 'played'

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const isPrivatePlayer = player => {
  return (
    player?.isPrivatePlayer === true ||
    player?.playerSource === 'private'
  )
}

const getPlayerSourceGames = ({ player, team }) => {
  if (isPrivatePlayer(player)) {
    return Array.isArray(player?.externalGames)
      ? player.externalGames
      : emptyArray
  }

  return Array.isArray(team?.teamGames)
    ? team.teamGames
    : emptyArray
}

const getPlayerId = player => {
  return asText(player?.playerId || player?.id)
}

const getGameObject = row => {
  return row?.game || row || {}
}

const getGameId = row => {
  const game = getGameObject(row)

  return asText(
    row?.gameId ||
      row?.id ||
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

const getGameDate = row => {
  const game = getGameObject(row)

  return (
    row?.gameDate ||
    game?.gameDate ||
    row?.date ||
    game?.date ||
    ''
  )
}

const getGameTime = row => {
  const time = new Date(getGameDate(row)).getTime()

  return Number.isFinite(time) ? time : 0
}

const getGamePlayers = row => {
  const game = getGameObject(row)

  if (Array.isArray(row?.gamePlayers)) return row.gamePlayers
  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(row?.players)) return row.players
  if (Array.isArray(game?.players)) return game.players

  return emptyArray
}

const getPlayerGameId = row => {
  return asText(
    row?.playerId ||
      row?.id ||
      row?.player?.id ||
      row?.player?.playerId ||
      ''
  )
}

const getPlayerGame = ({ row, playerId }) => {
  const gamePlayers = getGamePlayers(row)

  return gamePlayers.find(item => {
    return getPlayerGameId(item) === playerId
  }) || null
}

const sortGamesAsc = games => {
  return [...games].sort((a, b) => {
    const timeDiff = getGameTime(a) - getGameTime(b)

    if (timeDiff !== 0) return timeDiff

    return getGameId(a).localeCompare(getGameId(b))
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

const buildPlayerGameById = ({ games, playerId }) => {
  return games.reduce((acc, row) => {
    const gameId = getGameId(row)
    const playerGame = getPlayerGame({ row, playerId })

    if (gameId && playerGame) {
      acc[gameId] = playerGame
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

const hasPlayerInGame = ({ row, playerId, privatePlayer }) => {
  if (privatePlayer) return true

  return Boolean(getPlayerGame({ row, playerId }))
}

export const buildPlayerGamesBase = ({ player, team } = {}) => {
  const playerId = getPlayerId(player)
  const privatePlayer = isPrivatePlayer(player)

  const allGames = sortGamesAsc(
    getPlayerSourceGames({ player, team })
  )

  const leagueGames = allGames.filter(isLeagueGame)
  const playedLeagueGames = leagueGames.filter(isPlayedGame)

  const plannedLeagueGames = leagueGames.filter(row => {
    return !isPlayedGame(row)
  })

  const playerGames = leagueGames.filter(row => {
    return hasPlayerInGame({ row, playerId, privatePlayer })
  })

  const playedPlayerGames = playedLeagueGames.filter(row => {
    return hasPlayerInGame({ row, playerId, privatePlayer })
  })

  return {
    allGames,
    leagueGames,
    playedLeagueGames,
    plannedLeagueGames,

    playerGames,
    playedPlayerGames,

    byId: buildById(allGames),
    leagueById: buildById(leagueGames),
    playedLeagueById: buildById(playedLeagueGames),
    playerById: buildById(playerGames),
    playedPlayerById: buildById(playedPlayerGames),

    playerGameById: buildPlayerGameById({
      games: playerGames,
      playerId,
    }),

    counts: {
      all: allGames.length,
      league: leagueGames.length,
      playedLeague: playedLeagueGames.length,
      plannedLeague: plannedLeagueGames.length,
      playerGames: playerGames.length,
      playedPlayerGames: playedPlayerGames.length,
    },
  }
}
