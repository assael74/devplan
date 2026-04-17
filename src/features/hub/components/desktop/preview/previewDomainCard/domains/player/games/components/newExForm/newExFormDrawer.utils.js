// previewDomainCard/domains/team/games/components/neExwForm/newExFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const toNumOrZero = (v) => {
  if (v === '' || v == null) return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const toBool = (v, fallback = false) => {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return fallback
}

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

function buildComparableDraft(draft = {}) {
  return {
    playerId: safe(draft?.playerId),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),
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

export function buildInitialExDraft(context = {}) {
  const player = context?.player || context?.entity || null

  return {
    gameId: '',
    playerId: safe(context?.playerId || player?.id),

    teamId: safe(context?.teamId || player?.teamId || player?.team?.id),
    clubId: safe(context?.clubId || player?.clubId || player?.club?.id || player?.club?.clubId),

    teamName: safe(player?.teamName || player?.team?.teamName),
    clubName: safe(player?.clubName || player?.club?.clubName),

    gameDate: '',
    gameHour: '',
    rivel: '',
    home: true,
    difficulty: '',
    type: '',
    gameDuration: '',
    goalsFor: 0,
    goalsAgainst: 0,
    result: 'draw',

    isSelected: true,
    isStarting: false,
    goals: 0,
    assists: 0,
    timePlayed: 0,

    gameSource: 'external',
    isExternalGame: true,
  }
}

export function getIsExDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableDraft(draft)) !==
    JSON.stringify(buildComparableDraft(initial))
  )
}

export function getExFieldErrors(draft = {}) {
  const hasPlayerId = !!safe(draft?.playerId)
  const hasTeamName = !!safe(draft?.teamName)
  const hasClubName = !!safe(draft?.clubName)
  const hasRival = !!safe(draft?.rivel)

  const gameDate = safe(draft?.gameDate)
  const hasType = !!safe(draft?.type)
  const hasDuration = safe(draft?.gameDuration) !== ''

  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goals = toNumOrZero(draft?.goals)
  const assists = toNumOrZero(draft?.assists)
  const timePlayed = toNumOrZero(draft?.timePlayed)
  const isSelected = toBool(draft?.isSelected, true)

  return {
    playerId: !hasPlayerId,
    teamName: !hasTeamName,
    clubName: !hasClubName,
    rivel: !hasRival,
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    type: !hasType,
    gameDuration: !hasDuration,
    goals: goals > goalsFor,
    assists: assists > goalsFor,
    timePlayed: !isSelected && timePlayed > 0,
  }
}

export function getExValidity(draft = {}) {
  const fieldErrors = getExFieldErrors(draft)

  const ok = !Object.values(fieldErrors).some(Boolean)

  if (fieldErrors.playerId) {
    return { ok: false, message: 'חסר שחקן' }
  }

  if (fieldErrors.teamName || fieldErrors.clubName) {
    return { ok: false, message: 'חסר שם קבוצה או מועדון' }
  }

  if (fieldErrors.rivel) {
    return { ok: false, message: 'יש להזין יריבה' }
  }

  if (fieldErrors.gameDate) {
    return { ok: false, message: 'יש להזין תאריך משחק תקין' }
  }

  if (fieldErrors.type) {
    return { ok: false, message: 'יש לבחור סוג משחק' }
  }

  if (fieldErrors.gameDuration) {
    return { ok: false, message: 'יש לבחור משך משחק' }
  }

  if (fieldErrors.goals) {
    return { ok: false, message: 'כמות שערי השחקן גדולה מכמות שערי הקבוצה' }
  }

  if (fieldErrors.assists) {
    return { ok: false, message: 'כמות הבישולים גדולה מכמות שערי הקבוצה' }
  }

  if (fieldErrors.timePlayed) {
    return { ok: false, message: 'לא ניתן להזין דקות משחק כשהשחקן לא בסגל' }
  }

  return {
    ok,
    message: '',
  }
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

export function normalizeExDraftBeforeSave(draft = {}) {
  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goalsAgainst = toNumOrZero(draft?.goalsAgainst)

  const result =
    goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw'

  return {
    ...draft,
    playerId: safe(draft?.playerId),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),

    teamName: safe(draft?.teamName),
    clubName: safe(draft?.clubName),

    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    rivel: safe(draft?.rivel),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: safe(draft?.gameDuration),

    home: toBool(draft?.home, true),

    goalsFor,
    goalsAgainst,
    result,

    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    goals: Math.min(toNumOrZero(draft?.goals), goalsFor),
    assists: Math.min(toNumOrZero(draft?.assists), goalsFor),
    timePlayed: toNumOrZero(draft?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,
  }
}
