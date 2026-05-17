// src/shared/games/playerStats/buildPlayerGamesStats.js

import { isGamePlayed } from '../../games/games.constants.js'

const DEFAULT_GAME_DURATION = 90

const toNumber = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toPercent = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

const asText = (value) => {
  return value == null ? '' : String(value).trim()
}

const safeLabel = (value, total) => {
  return `${Number(value) || 0}/${Number(total) || 0}`
}

const getGameObject = (row = {}) => {
  return row?.game || row
}

const getGamePlayers = (row = {}) => {
  const game = getGameObject(row)

  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers

  return []
}

const pickPlayerId = (item = {}) => {
  return item?.playerId || ''
}

const isSamePlayer = ({
  item,
  playerId,
}) => {
  return asText(pickPlayerId(item)) === asText(playerId)
}

const getAvailableGameMinutes = ({
  row,
  team,
}) => {
  const game = getGameObject(row)

  return (
    toNumber(team?.leagueGameTime, 0) ||
    toNumber(game?.gameDuration, 0) ||
    DEFAULT_GAME_DURATION
  )
}

const getTimePlayed = (item = {}) => {
  return toNumber(item?.timePlayed, 0)
}

const isPlayerPlayed = (item = {}) => {
  return getTimePlayed(item) > 0
}

const isPlayerOnSquad = (item = {}) => {
  return (
    item?.onSquad === true ||
    item?.inSquad === true ||
    isPlayerPlayed(item)
  )
}

const isPlayerStarted = (item = {}) => {
  return item?.onStart === true
}

const getGoals = (item = {}) => {
  return toNumber(item?.goals, 0)
}

const getAssists = (item = {}) => {
  return toNumber(item?.assists, 0)
}

const isPlayedGame = (row = {}) => {
  const game = getGameObject(row)

  return isGamePlayed(row) || isGamePlayed(game)
}

const emptyStats = () => ({
  teamPlayedGames: 0,

  squadGames: 0,
  playerPlayedGames: 0,
  startedGames: 0,

  minutes: 0,
  availableMinutes: 0,
  minutesPct: 0,
  minutesPctLabel: '0%',

  squadLabel: '0/0',
  playedLabel: '0/0',
  startedLabel: '0/0',

  goals: 0,
  assists: 0,
  involvement: 0,

  hasGamesData: false,
})

export const buildPlayerGamesStats = ({
  playerId,
  games,
  team,
}) => {
  const id = asText(playerId)
  const base = Array.isArray(games) ? games : []

  if (!id || !base.length) {
    return emptyStats()
  }

  const playedGames = base.filter(isPlayedGame)

  let squadGames = 0
  let playerPlayedGames = 0
  let startedGames = 0
  let minutes = 0
  let availableMinutes = 0
  let goals = 0
  let assists = 0

  playedGames.forEach((row) => {
    const gameMinutes = getAvailableGameMinutes({
      row,
      team,
    })

    availableMinutes += gameMinutes

    const gamePlayer = getGamePlayers(row).find((item) =>
      isSamePlayer({
        item,
        playerId: id,
      })
    )

    if (!gamePlayer) return

    if (isPlayerOnSquad(gamePlayer)) {
      squadGames += 1
    }

    if (isPlayerPlayed(gamePlayer)) {
      playerPlayedGames += 1
    }

    if (isPlayerStarted(gamePlayer)) {
      startedGames += 1
    }

    minutes += getTimePlayed(gamePlayer)
    goals += getGoals(gamePlayer)
    assists += getAssists(gamePlayer)
  })

  const minutesPct = availableMinutes > 0
    ? toPercent((minutes / availableMinutes) * 100)
    : 0

  return {
    teamPlayedGames: playedGames.length,

    squadGames,
    playerPlayedGames,
    startedGames,

    minutes,
    availableMinutes,
    minutesPct,
    minutesPctLabel: `${minutesPct}%`,

    squadLabel: safeLabel(squadGames, playedGames.length),
    playedLabel: safeLabel(playerPlayedGames, squadGames),
    startedLabel: safeLabel(startedGames, squadGames),

    goals,
    assists,
    involvement: goals + assists,

    hasGamesData: playedGames.length > 0,
  }
}
