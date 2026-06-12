// src/features/bulkActions/games/delete/logic/resolveGamesDeleteScope.js

import { GAMES_DELETE_SCOPE } from '../configs/gamesDelete.config.js'

const asArray = value => (Array.isArray(value) ? value : [])

export function resolveGamesDeleteScope(params = {}) {
  const {
    scope = GAMES_DELETE_SCOPE.SELECTED,
    games = [],
    selectedGameIds = [],
  } = params

  const sourceGames = asArray(games)
  const selectedIds = new Set(asArray(selectedGameIds).filter(Boolean))

  if (scope === GAMES_DELETE_SCOPE.ALL_TEAM_GAMES) {
    return sourceGames
  }

  return sourceGames.filter(game => {
    const gameId = game?.id || game?.gameId
    return selectedIds.has(gameId)
  })
}
