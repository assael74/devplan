// features/hub/editLogic/games/externalGames/externalGameEdit.model.js

export const safe = (value) => (value == null ? '' : String(value).trim())

export const toNumOrZero = (value) => {
  if (value === '' || value == null) return 0

  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

export const toBool = (value, fallback = false) => {
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

const GAME_STATUS_SCHEDULED = 'scheduled'
const GAME_STATUS_PLAYED = 'played'

const toNumOrEmpty = value => {
  if (value === '' || value == null) return ''

  const num = Number(value)

  return Number.isFinite(num) ? num : ''
}

const calcResultByGoals = (goalsFor, goalsAgainst) => {
  const goalsForNum = Number(goalsFor)
  const goalsAgainstNum = Number(goalsAgainst)

  if (!Number.isFinite(goalsForNum) || !Number.isFinite(goalsAgainstNum)) return ''
  if (goalsForNum > goalsAgainstNum) return 'win'
  if (goalsForNum < goalsAgainstNum) return 'loss'

  return 'draw'
}

const isPlayedStatus = gameStatus => {
  return safe(gameStatus) === GAME_STATUS_PLAYED
}

const resolvePlayedResult = ({ gameStatus, source, goalsFor, goalsAgainst }) => {
  if (!isPlayedStatus(gameStatus)) return ''

  return safe(source?.result) || calcResultByGoals(goalsFor, goalsAgainst) || ''
}

const buildComparableExternalGameDraft = (draft = {}) => {
  return {
    id: safe(draft?.id || draft?.gameId),
    gameId: safe(draft?.gameId || draft?.id),
    playerId: safe(draft?.playerId),

    teamName: safe(draft?.teamName),
    clubName: safe(draft?.clubName),

    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    gameLeagueNum: toNumOrEmpty(draft?.gameLeagueNum),
    vLink: safe(draft?.vLink),
    rivel: safe(draft?.rivel),
    home: toBool(draft?.home, true),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: safe(draft?.gameDuration),
    gameStatus: safe(draft?.gameStatus || GAME_STATUS_SCHEDULED),

    goalsFor: toNumOrEmpty(draft?.goalsFor),
    goalsAgainst: toNumOrEmpty(draft?.goalsAgainst),
    result: safe(draft?.result),

    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),
  }
}

export function buildExternalGameEditInitial(row = {}, context = {}) {
  const source = row?.game || row || {}
  const player = context?.player || context?.entity || null

  const goalsFor = toNumOrEmpty(source?.goalsFor)
  const goalsAgainst = toNumOrEmpty(source?.goalsAgainst)
  const gameStatus = safe(source?.gameStatus) || GAME_STATUS_SCHEDULED

  const result = resolvePlayedResult({
    gameStatus,
    source,
    goalsFor,
    goalsAgainst,
  })

  return {
    id: safe(source?.id || row?.id || row?.gameId),
    gameId: safe(source?.id || row?.id || row?.gameId),

    playerId: safe(source?.playerId || row?.playerId || context?.playerId || player?.id),

    teamId: safe(source?.teamId || player?.teamId),
    clubId: safe(source?.clubId || player?.clubId),

    teamName: safe(source?.teamName || player?.teamName || player?.team?.teamName),
    clubName: safe(source?.clubName || player?.clubName || player?.club?.clubName),

    rivel: safe(source?.rivel || source?.rival),
    gameDate: safe(source?.gameDate),
    gameHour: safe(source?.gameHour),
    gameLeagueNum: toNumOrEmpty(source?.gameLeagueNum),
    vLink: safe(source?.vLink),

    home: source?.home ?? '',
    difficulty: safe(source?.difficulty),
    type: safe(source?.type),
    gameDuration: toNumOrEmpty(source?.gameDuration ?? source?.duration),

    goalsFor,
    goalsAgainst,
    result,
    gameStatus,

    isSelected: toBool(source?.isSelected, true),
    isStarting: toBool(source?.isStarting, false),
    goals: toNumOrZero(source?.goals),
    assists: toNumOrZero(source?.assists),
    timePlayed: toNumOrZero(source?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,

    raw: source,
  }
}

export function buildExternalGameEditFieldErrors(draft = {}) {
  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goals = toNumOrZero(draft?.goals)
  const assists = toNumOrZero(draft?.assists)
  const timePlayed = toNumOrZero(draft?.timePlayed)
  const isSelected = toBool(draft?.isSelected, true)

  const gameDate = safe(draft?.gameDate)

  return {
    gameId: !safe(draft?.gameId),
    playerId: !safe(draft?.playerId),
    teamName: !safe(draft?.teamName),
    clubName: !safe(draft?.clubName),
    rivel: !safe(draft?.rivel),
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    type: !safe(draft?.type),
    gameDuration: !safe(draft?.gameDuration),
    goals: goals > goalsFor,
    assists: assists > goalsFor,
    timePlayed: !isSelected && timePlayed > 0,
  }
}

export function getIsExternalGameEditValid(draft = {}) {
  return !Object.values(buildExternalGameEditFieldErrors(draft)).some(Boolean)
}

export function isExternalGameEditDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableExternalGameDraft(draft)) !==
    JSON.stringify(buildComparableExternalGameDraft(initial))
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

const hasChanged = (draft = {}, initial = {}, key, normalize = safe) => {
  return normalize(draft?.[key]) !== normalize(initial?.[key])
}

const hasAnyChanged = (draft = {}, initial = {}, fields = []) => {
  return fields.some(({ key, normalize }) => hasChanged(draft, initial, key, normalize))
}

export function buildExternalGameEditPatch({ draft, initial = {} }) {
  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goalsAgainst = toNumOrZero(draft?.goalsAgainst)
  const gameStatus = safe(draft?.gameStatus) || GAME_STATUS_SCHEDULED
  const initialGameStatus = safe(initial?.gameStatus) || GAME_STATUS_SCHEDULED

  const result = isPlayedStatus(gameStatus)
    ? calcResultByGoals(goalsFor, goalsAgainst)
    : ''

  const playerGoals = Math.min(toNumOrZero(draft?.goals), goalsFor)
  const playerAssists = Math.min(toNumOrZero(draft?.assists), goalsFor)

  const patch = {}

  if (hasChanged(draft, initial, 'rivel')) patch.rivel = safe(draft?.rivel)
  if (hasChanged(draft, initial, 'home', value => toBool(value, true))) {
    patch.home = toBool(draft?.home, true)
  }
  if (hasChanged(draft, initial, 'difficulty')) patch.difficulty = safe(draft?.difficulty)
  if (hasChanged(draft, initial, 'type')) patch.type = safe(draft?.type)
  if (hasChanged(draft, initial, 'gameDate')) patch.gameDate = safe(draft?.gameDate)
  if (hasChanged(draft, initial, 'gameHour')) patch.gameHour = safe(draft?.gameHour)
  if (hasChanged(draft, initial, 'gameLeagueNum', toNumOrEmpty)) {
    patch.gameLeagueNum = safe(draft?.gameLeagueNum)
  }
  if (hasChanged(draft, initial, 'vLink')) patch.vLink = safe(draft?.vLink)
  if (hasChanged(draft, initial, 'gameDuration')) {
    patch.gameDuration = safe(draft?.gameDuration)
  }

  const scoreChanged =
    hasChanged(draft, initial, 'goalsFor', toNumOrEmpty) ||
    hasChanged(draft, initial, 'goalsAgainst', toNumOrEmpty)
  const statusChanged = gameStatus !== initialGameStatus

  if (statusChanged) patch.gameStatus = gameStatus
  if (hasChanged(draft, initial, 'goalsFor', toNumOrEmpty)) patch.goalsFor = goalsFor
  if (hasChanged(draft, initial, 'goalsAgainst', toNumOrEmpty)) {
    patch.goalsAgainst = goalsAgainst
  }
  if (scoreChanged || statusChanged || safe(draft?.result) !== safe(initial?.result)) {
    patch.result = result
  }

  const entryChanged = hasAnyChanged(draft, initial, [
    { key: 'isSelected', normalize: value => toBool(value, true) },
    { key: 'isStarting', normalize: value => toBool(value, false) },
    { key: 'goals', normalize: toNumOrZero },
    { key: 'assists', normalize: toNumOrZero },
    { key: 'timePlayed', normalize: toNumOrZero },
  ])

  if (entryChanged) {
    patch.gamePlayers = {
      playerId: safe(draft?.playerId),
      isSelected: toBool(draft?.isSelected, true),
      isStarting: toBool(draft?.isStarting, false),
      onSquad: toBool(draft?.isSelected, true),
      onStart: toBool(draft?.isStarting, false),
      goals: playerGoals,
      assists: playerAssists,
      timePlayed: toNumOrZero(draft?.timePlayed),
    }
  }

  return patch
}
