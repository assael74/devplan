// teamProfile/sharedLogic/games/insightsLogic/rows/gameRows.selectors.js

import { isGamePlayed } from '../../../../../../../shared/games/games.constants.js'

export const getGameObject = (row = {}) => {
  return row?.game || row
}

export const getGamesRows = (games = {}) => {
  if (Array.isArray(games?.rows)) return games.rows
  if (Array.isArray(games?.items)) return games.items
  if (Array.isArray(games?.games)) return games.games
  if (Array.isArray(games?.allGames)) return games.allGames

  return []
}

export const isPlayedGame = (row = {}) => {
  const game = getGameObject(row)

  return isGamePlayed(row) || isGamePlayed(game)
}

export const isUpcomingGame = (row = {}) => {
  return !isPlayedGame(row)
}

export const getPlayedRows = (games = {}) => {
  if (Array.isArray(games?.playedRows)) return games.playedRows
  if (Array.isArray(games?.playedGames)) return games.playedGames

  return getGamesRows(games).filter(isPlayedGame)
}

export const getUpcomingRows = (games = {}) => {
  if (Array.isArray(games?.upcomingRows)) return games.upcomingRows
  if (Array.isArray(games?.upcomingGames)) return games.upcomingGames

  return getGamesRows(games).filter(isUpcomingGame)
}
