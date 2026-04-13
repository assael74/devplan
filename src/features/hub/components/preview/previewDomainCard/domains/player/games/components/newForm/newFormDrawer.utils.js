// previewDomainCard/domains/team/games/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const toNumOrZero = (v) => {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const toArr = (v) => (Array.isArray(v) ? v : [])

const safeId = (v) => (v == null ? '' : String(v))

const findSelectedGame = (player, gameId) => {
  const games = Array.isArray(player?.teamGames) ? player.teamGames : []
  return games.find((game) => safeId(game?.id) === safeId(gameId)) || null
}

const getGamePlayers = (game) => {
  if (Array.isArray(game?.players)) return game.players
  if (Array.isArray(game?.gamePlayers)) return game.gamePlayers
  if (Array.isArray(game?.playersStats)) return game.playersStats
  return []
}

const sumFieldExceptPlayer = (players, fieldKey, playerId) => {
  return toArr(players).reduce((sum, item) => {
    const currentPlayerId = safeId(item?.playerId || item?.id)
    if (currentPlayerId === safeId(playerId)) return sum
    return sum + toNumOrZero(item?.[fieldKey])
  }, 0)
}

const getGoalsFor = (game) => {
  return toNumOrZero(game?.goalsFor)
}

export function buildInitialDraft(context = {}) {
  const player = context?.player || context?.entity || null

  return {
    gameId: '',
    playerId: safe(context?.playerId || player?.id),
    teamId: safe(context?.teamId || player?.teamId || player?.team?.id),
    clubId: safe(context?.clubId || player?.clubId || player?.club?.id),

    isSelected: true,
    isStarting: false,

    goals: 0,
    assists: 0,
    timePlayed: 0,
  }
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}

export function getIsValid(draft = {}) {
  return !!safe(draft?.gameId) && !!safe(draft?.playerId)
}

export function buildPlayerGameEntry(draft = {}) {
  return {
    playerId: safe(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    onSquad: draft?.isSelected === true,
    onStart: draft?.isStarting === true,
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),
  }
}

export function getGameStatsLimits({ player, gameId, playerId, draft }) {
  const game = findSelectedGame(player, gameId || draft?.gameId)

  if (!game) {
    return {
      totalGoalsInGame: 0,
      totalAssistsInGame: 0,
      otherGoalsUsed: 0,
      otherAssistsUsed: 0,
      currentGoals: toNumOrZero(draft?.goals),
      currentAssists: toNumOrZero(draft?.assists),
      goalsMax: 0,
      assistsMax: 0,
      goalsLeft: 0,
      assistsLeft: 0,
      hasGoalUpdates: false,
      game: null,
    }
  }

  const goalsFor = getGoalsFor(game)
  const players = getGamePlayers(game)

  const otherGoalsUsed = sumFieldExceptPlayer(players, 'goals', playerId)
  const otherAssistsUsed = sumFieldExceptPlayer(players, 'assists', playerId)

  const currentGoals = toNumOrZero(draft?.goals)
  const currentAssists = toNumOrZero(draft?.assists)

  const goalsMax = Math.max(0, goalsFor - otherGoalsUsed)
  const assistsMax = Math.max(0, goalsFor - otherAssistsUsed)

  return {
    totalGoalsInGame: goalsFor,
    totalAssistsInGame: goalsFor,
    otherGoalsUsed,
    otherAssistsUsed,
    currentGoals,
    currentAssists,
    goalsMax,
    assistsMax,
    goalsLeft: Math.max(0, goalsMax - currentGoals),
    assistsLeft: Math.max(0, assistsMax - currentAssists),
    hasGoalUpdates: otherGoalsUsed > 0 || otherAssistsUsed > 0,
    game,
  }
}

export function buildPlayerListPatch({ game, draft }) {
  const currentList = toArr(game?.gamePlayers)

  const nextItem = {
    playerId: safeId(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    onSquad: draft?.isSelected === true,
    onStart: draft?.isStarting === true,
    goals: Number(draft?.goals || 0),
    assists: Number(draft?.assists || 0),
    timePlayed: Number(draft?.timePlayed || 0),
  }

  const existsIndex = currentList.findIndex(
    (item) => safeId(item?.playerId) === safeId(draft?.playerId)
  )

  const nextPlayerList =
    existsIndex >= 0
      ? currentList.map((item, index) =>
          index === existsIndex ? { ...item, ...nextItem } : item
        )
      : [...currentList, nextItem]

  return {
    gamePlayers: nextPlayerList,
  }
}
