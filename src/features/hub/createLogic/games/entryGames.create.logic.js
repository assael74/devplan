const safe = (v) => (v == null ? '' : String(v).trim())

const safeId = (v) => (v == null ? '' : String(v))

const toNumOrZero = (v) => {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const toArr = (v) => (Array.isArray(v) ? v : [])

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

const getGoalsFor = (game) => toNumOrZero(game?.goalsFor)

function buildComparableEntryGameCreateDraft(draft = {}) {
  return {
    gameId: safe(draft?.gameId),
    playerId: safe(draft?.playerId),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),
  }
}

export function buildEntryGameCreateDraft(context = {}) {
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

export function isEntryGameCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableEntryGameCreateDraft(draft)) !==
    JSON.stringify(buildComparableEntryGameCreateDraft(initial))
  )
}

export function validateEntryGameCreateDraft(draft = {}) {
  const errors = {
    gameId: !safe(draft?.gameId),
    playerId: !safe(draft?.playerId),
  }

  const valid = !Object.values(errors).some(Boolean)

  if (errors.gameId) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור משחק',
      errors,
    }
  }

  if (errors.playerId) {
    return {
      valid: false,
      ok: false,
      message: 'חסר שחקן',
      errors,
    }
  }

  return {
    valid,
    ok: valid,
    message: '',
    errors,
  }
}

export function buildEntryGamePlayerPayload(draft = {}) {
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

export function buildEntryGameCreatePayload(draft = {}, context = {}) {
  return {
    gameId: safe(draft?.gameId),
    playerId: safe(draft?.playerId || context?.playerId || context?.player?.id),
    teamId: safe(
      draft?.teamId ||
        context?.teamId ||
        context?.player?.teamId ||
        context?.player?.team?.id
    ),
    clubId: safe(
      draft?.clubId ||
        context?.clubId ||
        context?.player?.clubId ||
        context?.player?.club?.id
    ),
    entry: buildEntryGamePlayerPayload(draft),
    updatedAt: Date.now(),
  }
}

export function getEntryGameStatsLimits({ player, gameId, playerId, draft }) {
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

export function buildEntryGamePlayerListPatch({ game, draft }) {
  const currentList = toArr(game?.gamePlayers)

  const nextItem = {
    playerId: safeId(draft?.playerId),
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    onSquad: draft?.isSelected === true,
    onStart: draft?.isStarting === true,
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),
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

export function buildEntryGameCreateMeta(draft = {}, context = {}) {
  const validation = validateEntryGameCreateDraft(draft, context)

  return {
    title: 'הוספת שחקן למשחק',
    saveText: 'שמירה',
    savingText: 'שומר...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
  }
}
