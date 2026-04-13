// previewDomainCard/domains/player/games/components/drawer/editDrawer.utils.js

const safeId = (value) => (value == null ? '' : String(value))

const toNum = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const toArr = (value) => (Array.isArray(value) ? value : [])

const resolveGameGoalsFor = (game) => {
  return toNum(game?.goalsFor || 0)
}

export const buildInitialDraft = (row = {}) => {
  const game = row?.game || row || {}
  const stats = row?.stats || row || {}

  return {
    gameId: safeId(game?.id || row?.id || row?.gameId),
    playerId: safeId(stats?.playerId || row?.playerId),
    goals: toNum(stats?.goals ?? row?.goals),
    assists: toNum(stats?.assists ?? row?.assists),
    timePlayed: toNum(stats?.timePlayed ?? row?.timePlayed),
    isSelected:
      stats?.isSelected === true ||
      stats?.onSquad === true ||
      row?.isSelected === true,
    isStarting:
      stats?.isStarting === true ||
      stats?.onStart === true ||
      row?.isStarting === true,
    raw: game,
  }
}

export const getIsDirty = (draft = {}, initial = {}) =>
  toNum(draft?.goals) !== toNum(initial?.goals) ||
  toNum(draft?.assists) !== toNum(initial?.assists) ||
  toNum(draft?.timePlayed) !== toNum(initial?.timePlayed) ||
  !!draft?.isSelected !== !!initial?.isSelected ||
  !!draft?.isStarting !== !!initial?.isStarting

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
  const rows = toArr(game?.gamePlayers)

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
    hasGoalUpdates: otherGoalsUsed > 0 || otherAssistsUsed > 0,
  }
}
