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

function buildComparableExternalGameCreateDraft(draft = {}) {
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

export function buildExternalGameCreateDraft(context = {}) {
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

export function isExternalGameCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableExternalGameCreateDraft(draft)) !==
    JSON.stringify(buildComparableExternalGameCreateDraft(initial))
  )
}

export function getExternalGameCreateFieldErrors(draft = {}) {
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

export function validateExternalGameCreateDraft(draft = {}) {
  const errors = getExternalGameCreateFieldErrors(draft)
  const valid = !Object.values(errors).some(Boolean)

  if (errors.playerId) {
    return { valid: false, ok: false, message: 'חסר שחקן', errors }
  }

  if (errors.teamName || errors.clubName) {
    return { valid: false, ok: false, message: 'חסר שם קבוצה או מועדון', errors }
  }

  if (errors.rivel) {
    return { valid: false, ok: false, message: 'יש להזין יריבה', errors }
  }

  if (errors.gameDate) {
    return { valid: false, ok: false, message: 'יש להזין תאריך משחק תקין', errors }
  }

  if (errors.type) {
    return { valid: false, ok: false, message: 'יש לבחור סוג משחק', errors }
  }

  if (errors.gameDuration) {
    return { valid: false, ok: false, message: 'יש לבחור משך משחק', errors }
  }

  if (errors.goals) {
    return {
      valid: false,
      ok: false,
      message: 'כמות שערי השחקן גדולה מכמות שערי הקבוצה',
      errors,
    }
  }

  if (errors.assists) {
    return {
      valid: false,
      ok: false,
      message: 'כמות הבישולים גדולה מכמות שערי הקבוצה',
      errors,
    }
  }

  if (errors.timePlayed) {
    return {
      valid: false,
      ok: false,
      message: 'לא ניתן להזין דקות משחק כשהשחקן לא בסגל',
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

export function normalizeExternalGameCreateDraft(draft = {}) {
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

export function buildExternalGameCreatePayload(draft = {}, context = {}) {
  const normalized = normalizeExternalGameCreateDraft({
    ...draft,
    playerId: draft?.playerId || context?.playerId || context?.player?.id,
    teamId: draft?.teamId || context?.teamId || context?.player?.teamId,
    clubId: draft?.clubId || context?.clubId || context?.player?.clubId,
  })

  return {
    ...normalized,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function buildExternalGameCreateMeta(draft = {}, context = {}) {
  const validation = validateExternalGameCreateDraft(draft, context)

  return {
    title: 'משחק חיצוני חדש',
    saveText: 'יצירת משחק',
    savingText: 'יוצר משחק...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
  }
}
