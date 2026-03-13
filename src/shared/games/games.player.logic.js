// shared/games/games.player.logic.js

import { n } from './games.summary.logic.js'

const safe = (v) => (v == null ? '' : String(v))

export const isPlayedGame = (gameOrRow) => {
  const result = safe(gameOrRow?.result).trim().toLowerCase()

  if (result === 'win' || result === 'draw' || result === 'loss') return true

  const goalsFor = Number(gameOrRow?.goalsFor)
  const goalsAgainst = Number(gameOrRow?.goalsAgainst)

  return Number.isFinite(goalsFor) && Number.isFinite(goalsAgainst)
}

export const getGameDurationSafe = (gameOrRow) => {
  const duration = Number(gameOrRow?.gameDuration)
  return Number.isFinite(duration) && duration > 0 ? duration : 90
}

export const calcPlayerParticipationSummary = ({ player, rows }) => {
  const teamGames = Array.isArray(player?.teamGames) ? player.teamGames : []
  const playerRows = Array.isArray(rows) ? rows : []

  const playedTeamGames = teamGames.filter(isPlayedGame)
  const playedPlayerRows = playerRows.filter(isPlayedGame)

  const teamGamesTotal = playedTeamGames.length
  const gamesIncluded = playedPlayerRows.length
  const gamesPct = teamGamesTotal > 0 ? Math.round((gamesIncluded / teamGamesTotal) * 100) : 0

  const minutesPlayed = playedPlayerRows.reduce((sum, row) => {
    return sum + n(row?.timePlayed)
  }, 0)

  const minutesPossible = playedTeamGames.reduce((sum, game) => {
    return sum + getGameDurationSafe(game)
  }, 0)

  const minutesPct =
    minutesPossible > 0 ? Math.round((minutesPlayed / minutesPossible) * 100) : 0

  const starts = playedPlayerRows.reduce((sum, row) => {
    return sum + (row?.isStarting === true ? 1 : 0)
  }, 0)

  const startsPctFromPlayed =
    gamesIncluded > 0 ? Math.round((starts / gamesIncluded) * 100) : 0

  const goals = playedPlayerRows.reduce((sum, row) => sum + n(row?.goals), 0)
  const assists = playedPlayerRows.reduce((sum, row) => sum + n(row?.assists), 0)

  const contributedPoints = playedPlayerRows.reduce((sum, row) => {
    return sum + n(row?.points)
  }, 0)

  const contributedPointsPossible = playedPlayerRows.length * 3
  const contributedPointsPct =
    contributedPointsPossible > 0
      ? Math.round((contributedPoints / contributedPointsPossible) * 100)
      : 0

  return {
    teamGamesTotal,
    gamesIncluded,
    gamesPct,
    minutesPlayed,
    minutesPossible,
    minutesPct,
    starts,
    startsPctFromPlayed,
    goals,
    assists,
    contributedPoints,
    contributedPointsPossible,
    contributedPointsPct,
  }
}
