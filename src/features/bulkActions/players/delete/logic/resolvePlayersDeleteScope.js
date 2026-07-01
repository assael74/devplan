// src/features/bulkActions/players/delete/logic/resolvePlayersDeleteScope.js

import { PLAYERS_DELETE_SCOPE } from '../configs/playersDelete.config.js'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function getPlayerId(player = {}) {
  return player?.id || player?.playerId || player?.player?.id || ''
}

export function resolvePlayersDeleteScope(params = {}) {
  const {
    scope = PLAYERS_DELETE_SCOPE.SELECTED,
    players = [],
    selectedPlayerIds = [],
  } = params

  const sourcePlayers = asArray(players)
  const selectedIds = new Set(asArray(selectedPlayerIds).filter(Boolean))

  if (scope === PLAYERS_DELETE_SCOPE.ALL_TEAM_PLAYERS) return sourcePlayers

  return sourcePlayers.filter(player => selectedIds.has(getPlayerId(player)))
}
