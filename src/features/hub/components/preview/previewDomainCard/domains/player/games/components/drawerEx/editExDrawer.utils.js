// previewDomainCard/domains/player/games/components/drawerEx/editExDrawer.utils.js

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

export function getIsExDirty(draft, initial) {
  return JSON.stringify(buildComparableDraft(draft)) !== JSON.stringify(buildComparableDraft(initial))
}

export function getExValidity(draft = {}) {
  const hasGameId = !!safe(draft?.gameId)
  const hasPlayerId = !!safe(draft?.playerId)
  const hasTeamName = !!safe(draft?.teamName)
  const hasClubName = !!safe(draft?.clubName)
  const hasRival = !!safe(draft?.rivel)
  const hasGameDate = !!safe(draft?.gameDate)
  const hasType = !!safe(draft?.type)
  const hasDuration = !!safe(draft?.gameDuration)

  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goals = toNumOrZero(draft?.goals)
  const assists = toNumOrZero(draft?.assists)
  const timePlayed = toNumOrZero(draft?.timePlayed)
  const isSelected = toBool(draft?.isSelected, true)

  if (!hasGameId) {
    return { ok: false, okDate: true, message: 'חסר משחק' }
  }

  if (!hasPlayerId) {
    return { ok: false, okDate: true, message: 'חסר שחקן' }
  }

  if (!hasClubName || !hasTeamName) {
    return { ok: false, okDate: true, message: 'חסר שם קבוצה או מועדון' }
  }

  if (!hasRival) {
    return { ok: false, okDate: true, message: 'יש להזין יריבה' }
  }

  if (!hasGameDate) {
    return { ok: false, okDate: false, message: 'יש להזין תאריך משחק' }
  }

  if (!hasType) {
    return { ok: false, okDate: true, message: 'יש לבחור סוג משחק' }
  }

  if (!hasDuration) {
    return { ok: false, okDate: true, message: 'יש לבחור משך משחק' }
  }

  if (goals > goalsFor) {
    return { ok: false, okDate: true, message: 'לא ניתן לעדכן יותר שערים מכמות שערי הקבוצה במשחק' }
  }

  if (assists > goalsFor) {
    return { ok: false, okDate: true, message: 'לא ניתן לעדכן יותר בישולים מכמות שערי הקבוצה במשחק' }
  }

  if (!isSelected && timePlayed > 0) {
    return { ok: false, okDate: true, message: 'לא ניתן לעדכן זמן משחק לשחקן שלא נכלל בסגל' }
  }

  return {
    ok: true,
    okDate: true,
    message: '',
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
      goals: playerGoals,
      assists: playerAssists,
      timePlayed: toNumOrZero(draft?.timePlayed),
    },
  }
}
