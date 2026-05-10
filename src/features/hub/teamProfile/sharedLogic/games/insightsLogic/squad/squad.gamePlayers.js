// teamProfile/sharedLogic/games/insightsLogic/squad/squad.gamePlayers.js

import { getGameObject } from '../rows/gameRows.selectors.js'
import { toNum } from '../common/view.shared.js'

export const getGamePlayers = (row = {}) => {
  const game = getGameObject(row)

  if (Array.isArray(row?.gamePlayers)) return row.gamePlayers
  if (Array.isArray(row?.players)) return row.players
  if (Array.isArray(row?.game?.gamePlayers)) return row.game.gamePlayers
  if (Array.isArray(row?.game?.players)) return row.game.players
  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(game?.players)) return game.players

  return []
}

export const getGamePlayerId = (item = {}) => {
  return item?.playerId || item?.id || item?.uid || ''
}

export const isStarter = (item = {}) => {
  return (
    item?.isStart === true ||
    item?.onStart === true ||
    item?.isStarting === true ||
    item?.isStarter === true ||
    item?.started === true ||
    item?.lineupStatus === 'starter'
  )
}

export const isUsedPlayer = (item = {}) => {
  const timePlayed = toNum(
    item?.timePlayed ??
      item?.minutes ??
      item?.playedMinutes
  )

  return (
    timePlayed > 0 ||
    item?.isSelected === true ||
    item?.played === true ||
    item?.wasUsed === true ||
    isStarter(item)
  )
}
