// playerProfile/modules/games/components/entryDrawer/logic/entryEditDrawer.utils.js

const safeId = (v) => (v == null ? '' : String(v))

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const toArr = (v) => (Array.isArray(v) ? v : [])

const resolveGameGoalsFor = (game) => {
  return toNum(game?.goalsFor || 0)
}

const findPlayerGameRow = (game, player) => {
  const gamePlayers = toArr(game?.gamePlayers)
  const playerId = safeId(player?.id || player?.playerId)

  return (
    gamePlayers.find((item) => safeId(item?.playerId || item?.id) === playerId) ||
    null
  )
}

export const buildInitialDraft = (game, player) => {
  const entry = findPlayerGameRow(game, player)

  return {
    gameId: safeId(game?.id || game?.gameId),
    playerId: safeId(player?.id || player?.playerId || entry?.playerId),
    goals: toNum(entry?.goals ?? game?.goals),
    assists: toNum(entry?.assists ?? game?.assists),
    timePlayed: toNum(entry?.timePlayed ?? game?.timePlayed),
    isSelected:
      entry?.isSelected === true ||
      entry?.onSquad === true ||
      game?.isSelected === true,
    isStarting:
      entry?.isStarting === true ||
      entry?.onStart === true ||
      game?.isStarting === true,
    raw: game || {},
  }
}

export const getIsDirty = (draft, initial) => {
  return (
    toNum(draft?.goals) !== toNum(initial?.goals) ||
    toNum(draft?.assists) !== toNum(initial?.assists) ||
    toNum(draft?.timePlayed) !== toNum(initial?.timePlayed) ||
    !!draft?.isSelected !== !!initial?.isSelected ||
    !!draft?.isStarting !== !!initial?.isStarting
  )
}

export const buildUpdateGamePlayersPatch = ({ game, draft }) => {
  const currentList = toArr(game?.gamePlayers)

  const nextItem = {
    playerId: safeId(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    onSquad: draft?.isSelected === true,
    onStart: draft?.isStarting === true,
    goals: toNum(draft?.goals),
    assists: toNum(draft?.assists),
    timePlayed: toNum(draft?.timePlayed),
  }

  const existsIndex = currentList.findIndex(
    (item) => safeId(item?.playerId) === safeId(draft?.playerId)
  )

  const nextGamePlayers =
    existsIndex >= 0
      ? currentList.map((item, index) =>
          index === existsIndex ? { ...item, ...nextItem } : item
        )
      : [...currentList, nextItem]

  return { gamePlayers: nextGamePlayers }
}

export const buildRemovePlayerFromGamePatch = ({ game, playerId }) => {
  const currentList = toArr(game?.gamePlayers)

  return {
    gamePlayers: currentList.filter(
      (item) => safeId(item?.playerId) !== safeId(playerId)
    ),
  }
}

export const getGameStatsLimits = ({ game, playerId, draft }) => {
  const pid = safeId(playerId || draft?.playerId)
  const rows = toArr(game?.game?.gamePlayers)

  const totalGoalsInGame = resolveGameGoalsFor(game)
  const totalAssistsInGame = totalGoalsInGame

  const otherPlayers = rows.filter(
    (item) => safeId(item?.playerId || item?.id) !== pid
  )

  const otherGoalsUsed = otherPlayers.reduce(
    (sum, item) => sum + toNum(item?.goals),
    0
  )

  const otherAssistsUsed = otherPlayers.reduce(
    (sum, item) => sum + toNum(item?.assists),
    0
  )

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
  }
}
