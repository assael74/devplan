// features/hub/editLogic/games/entryGames/playerGameEntry.model.js

import {
  safe,
  toNum,
  toArr,
  getGameSource,
  getGameId,
  getPlayerId,
  getGamePlayers,
} from './entryGame.shared.js'

const resolveGameGoalsFor = (game) => {
  const source = getGameSource(game)
  return toNum(source?.goalsFor || 0)
}

const findPlayerGameRow = (game, player) => {
  const gamePlayers = getGamePlayers(game)
  const playerId = getPlayerId(player)

  return (
    gamePlayers.find((item) => safe(item?.playerId || item?.id) === playerId) ||
    null
  )
}

export const buildPlayerGameEntryInitial = (game, playerOrContext = {}) => {
  const player = playerOrContext?.player || playerOrContext?.entity || playerOrContext || {}
  const source = getGameSource(game)
  const entry = findPlayerGameRow(source, player)

  return {
    gameId: getGameId(source),
    playerId: getPlayerId(player) || safe(entry?.playerId),

    goals: toNum(entry?.goals ?? source?.goals),
    assists: toNum(entry?.assists ?? source?.assists),
    timePlayed: toNum(entry?.timePlayed ?? source?.timePlayed),

    isSelected:
      entry?.isSelected === true ||
      entry?.onSquad === true ||
      source?.isSelected === true,

    isStarting:
      entry?.isStarting === true ||
      entry?.onStart === true ||
      source?.isStarting === true,

    raw: source || {},
  }
}

export const isPlayerGameEntryDirty = (draft = {}, initial = {}) => {
  return (
    toNum(draft?.goals) !== toNum(initial?.goals) ||
    toNum(draft?.assists) !== toNum(initial?.assists) ||
    toNum(draft?.timePlayed) !== toNum(initial?.timePlayed) ||
    Boolean(draft?.isSelected) !== Boolean(initial?.isSelected) ||
    Boolean(draft?.isStarting) !== Boolean(initial?.isStarting)
  )
}

export const buildUpdatePlayerGameEntryPatch = ({ game, draft }) => {
  const source = getGameSource(game)
  const currentList = toArr(source?.gamePlayers)

  const nextItem = {
    playerId: safe(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    onSquad: draft?.isSelected === true,
    onStart: draft?.isStarting === true,
    goals: toNum(draft?.goals),
    assists: toNum(draft?.assists),
    timePlayed: toNum(draft?.timePlayed),
  }

  const existsIndex = currentList.findIndex((item) => {
    return safe(item?.playerId) === safe(draft?.playerId)
  })

  const nextGamePlayers =
    existsIndex >= 0
      ? currentList.map((item, index) =>
          index === existsIndex ? { ...item, ...nextItem } : item
        )
      : [...currentList, nextItem]

  return {
    gamePlayers: nextGamePlayers,
  }
}

export const buildRemovePlayerGameEntryPatch = ({ game, playerId }) => {
  const source = getGameSource(game)
  const currentList = toArr(source?.gamePlayers)

  return {
    gamePlayers: currentList.filter((item) => {
      return safe(item?.playerId) !== safe(playerId)
    }),
  }
}

export const getPlayerGameEntryLimits = ({ game, playerId, draft }) => {
  const pid = safe(playerId || draft?.playerId)
  const rows = getGamePlayers(game)

  const totalGoalsInGame = resolveGameGoalsFor(game)
  const totalAssistsInGame = totalGoalsInGame

  const otherPlayers = rows.filter((item) => {
    return safe(item?.playerId || item?.id) !== pid
  })

  const otherGoalsUsed = otherPlayers.reduce((sum, item) => {
    return sum + toNum(item?.goals)
  }, 0)

  const otherAssistsUsed = otherPlayers.reduce((sum, item) => {
    return sum + toNum(item?.assists)
  }, 0)

  const currentGoals = toNum(draft?.goals)
  const currentAssists = toNum(draft?.assists)

  const goalsMax = Math.max(0, totalGoalsInGame - otherGoalsUsed)
  const assistsMax = Math.max(0, totalAssistsInGame - otherAssistsUsed)

  return {
    totalGoalsInGame,
    totalAssistsInGame,
    otherGoalsUsed,
    otherAssistsUsed,
    currentGoals,
    currentAssists,
    goalsMax,
    assistsMax,
    goalsLeft: Math.max(0, goalsMax - currentGoals),
    assistsLeft: Math.max(0, assistsMax - currentAssists),
    hasGoalUpdates: otherGoalsUsed > 0 || otherAssistsUsed > 0,
  }
}
