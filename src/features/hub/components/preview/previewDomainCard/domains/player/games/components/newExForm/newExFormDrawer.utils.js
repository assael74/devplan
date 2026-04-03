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

function buildComparableDraft(draft = {}) {
  return {
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

export function buildInitialExDraft(context = {}) {
  const player = context?.player || context?.entity || null

  return {
    playerId: safe(context?.playerId || player?.id),

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

export function getIsExDirty(draft, initial) {
  return JSON.stringify(buildComparableDraft(draft)) !== JSON.stringify(buildComparableDraft(initial))
}

export function getExValidity(draft = {}) {
  const hasPlayerId = !!safe(draft?.playerId)
  const hasTeamName = !!safe(draft?.teamName)
  const hasClubName = !!safe(draft?.clubName)
  const hasRival = !!safe(draft?.rivel)
  const hasGameDate = !!safe(draft?.gameDate)
  const hasType = !!safe(draft?.type)
  const hasDuration = String(draft?.gameDuration || '').trim() !== ''

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

  return {
    ok: true,
    okDate: true,
    message: '',
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

    teamName: safe(draft?.teamName),
    clubName: safe(draft?.clubName),

    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    rivel: safe(draft?.rivel),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: draft?.gameDuration,

    home: toBool(draft?.home, true),

    goalsFor,
    goalsAgainst,
    result,

    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    goals: toNumOrZero(draft?.goals),
    assists: toNumOrZero(draft?.assists),
    timePlayed: toNumOrZero(draft?.timePlayed),

    gameSource: 'external',
    isExternalGame: true,
  }
}
