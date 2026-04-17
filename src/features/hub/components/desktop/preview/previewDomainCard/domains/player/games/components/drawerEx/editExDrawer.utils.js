// previewDomainCard/domains/player/games/components/drawerEx/editExDrawer.utils.js

const safe = (value) => (value == null ? '' : String(value).trim())

const toNumOrZero = (value) => {
  if (value === '' || value == null) return 0
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const toBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

function buildComparableDraft(draft = {}) {
  return {
    gameId: safe(draft?.gameId),
    playerId: safe(draft?.playerId),
    teamName: safe(draft?.teamName),
    clubName: safe(draft?.clubName),

    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    rivel: safe(draft?.rivel),
    home: toBool(draft?.home, true),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: safe(draft?.gameDuration),

    goalsFor: toNumOrZero(draft?.goalsFor),
    goalsAgainst: toNumOrZero(draft?.goalsAgainst),
    result: safe(draft?.result || 'draw'),

    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),

    gameSource: safe(draft?.gameSource || 'external'),
    isExternalGame: draft?.isExternalGame === true,
  }
}

export function buildInitialExDraft(row = {}, context = {}) {
  const source = row?.game || row || {}
  const player = context?.player || context?.entity || null

  return {
    gameId: safe(source?.id || row?.id || row?.gameId),
    playerId: safe(source?.playerId || row?.playerId || context?.playerId || player?.id),

    teamName: safe(source?.teamName || player?.teamName || player?.team?.teamName),
    clubName: safe(source?.clubName || player?.clubName || player?.club?.clubName),

    gameDate: safe(source?.gameDate),
    gameHour: safe(source?.gameHour),
    rivel: safe(source?.rivel || source?.rival),
    home: toBool(source?.home, true),
    difficulty: safe(source?.difficulty),
    type: safe(source?.type),
    gameDuration: safe(source?.gameDuration),

    goalsFor: toNumOrZero(source?.goalsFor),
    goalsAgainst: toNumOrZero(source?.goalsAgainst),
    result: safe(source?.result || 'draw'),

    isSelected: toBool(source?.isSelected, true),
    isStarting: toBool(source?.isStarting, false),
    goals: toNumOrZero(source?.goals),
    assists: toNumOrZero(source?.assists),
    timePlayed: toNumOrZero(source?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,
  }
}

export function buildExFieldErrors(draft = {}) {
  const hasGameId = !!safe(draft?.gameId)
  const hasPlayerId = !!safe(draft?.playerId)
  const hasTeamName = !!safe(draft?.teamName)
  const hasClubName = !!safe(draft?.clubName)
  const hasRival = !!safe(draft?.rivel)

  const gameDate = safe(draft?.gameDate)
  const hasGameDate = !!gameDate
  const hasType = !!safe(draft?.type)
  const hasDuration = !!safe(draft?.gameDuration)

  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goals = toNumOrZero(draft?.goals)
  const assists = toNumOrZero(draft?.assists)
  const timePlayed = toNumOrZero(draft?.timePlayed)
  const isSelected = toBool(draft?.isSelected, true)

  return {
    gameId: !hasGameId,
    playerId: !hasPlayerId,
    teamName: !hasTeamName,
    clubName: !hasClubName,
    rivel: !hasRival,
    gameDate: !hasGameDate || !isValidDateFormat(gameDate),
    type: !hasType,
    gameDuration: !hasDuration,
    goals: goals > goalsFor,
    assists: assists > goalsFor,
    timePlayed: !isSelected && timePlayed > 0,
  }
}

export function getIsExValid(draft = {}) {
  const fieldErrors = buildExFieldErrors(draft)
  return !Object.values(fieldErrors).some(Boolean)
}

export function getIsExDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableDraft(draft)) !==
    JSON.stringify(buildComparableDraft(initial))
  )
}

export function buildExternalGameEntryLimits(draft = {}) {
  const totalGoalsInGame = toNumOrZero(draft?.goalsFor)
  const totalAssistsInGame = totalGoalsInGame
  const currentGoals = toNumOrZero(draft?.goals)
  const currentAssists = toNumOrZero(draft?.assists)

  return {
    totalGoalsInGame,
    totalAssistsInGame,
    otherGoalsUsed: 0,
    otherAssistsUsed: 0,
    currentGoals,
    currentAssists,
    goalsMax: totalGoalsInGame,
    assistsMax: totalAssistsInGame,
    goalsLeft: Math.max(0, totalGoalsInGame - currentGoals),
    assistsLeft: Math.max(0, totalAssistsInGame - currentAssists),
    hasGoalUpdates: false,
  }
}

export function buildUpdateExternalGamePatch({ draft }) {
  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goalsAgainst = toNumOrZero(draft?.goalsAgainst)

  const result =
    goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw'

  const playerGoals = Math.min(toNumOrZero(draft?.goals), goalsFor)
  const playerAssists = Math.min(toNumOrZero(draft?.assists), goalsFor)

  return {
    rivel: safe(draft?.rivel),
    home: toBool(draft?.home, true),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    gameDuration: safe(draft?.gameDuration),
    goalsFor,
    goalsAgainst,
    result,

    gamePlayers: {
      playerId: safe(draft?.playerId),
      isSelected: toBool(draft?.isSelected, true),
      isStarting: toBool(draft?.isStarting, false),
      onSquad: toBool(draft?.isSelected, true),
      onStart: toBool(draft?.isStarting, false),
      goals: playerGoals,
      assists: playerAssists,
      timePlayed: toNumOrZero(draft?.timePlayed),
    },
  }
}
