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

const getGameResult = ({ goalsFor, goalsAgainst }) => {
  const gf = toNumOrZero(goalsFor)
  const ga = toNumOrZero(goalsAgainst)

  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'
  return 'draw'
}

function buildComparableTeamGameCreateDraft(draft = {}) {
  return {
    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    rivel: safe(draft?.rivel),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),
    home: toBool(draft?.home, true),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: safe(draft?.gameDuration),
    goalsFor: toNumOrZero(draft?.goalsFor),
    goalsAgainst: toNumOrZero(draft?.goalsAgainst),
    result: safe(draft?.result),
  }
}

export function buildTeamGameCreateDraft(context = {}) {
  const entity = context?.entity || null
  const team = context?.team || entity || null

  const teamId = safe(context?.teamId || team?.id)
  const clubId = safe(context?.clubId || team?.clubId || team?.club?.id)

  return {
    gameDate: '',
    gameHour: '',
    rivel: '',
    teamId,
    clubId,
    home: true,
    difficulty: '',
    type: '',
    gameDuration: '',
    goalsFor: 0,
    goalsAgainst: 0,
    result: '',
  }
}

export function getTeamGameCreateFieldErrors(draft = {}) {
  const gameDate = safe(draft?.gameDate)
  const rivel = safe(draft?.rivel)
  const type = safe(draft?.type)
  const gameDuration = safe(draft?.gameDuration)
  const home = draft?.home

  return {
    gameDate: !gameDate || !isValidDateFormat(gameDate),
    rivel: !rivel,
    type: !type,
    gameDuration: !gameDuration,
    home: home !== true && home !== false,
  }
}

export function validateTeamGameCreateDraft(draft = {}) {
  const fieldErrors = getTeamGameCreateFieldErrors(draft)
  const valid = !Object.values(fieldErrors).some(Boolean)

  if (fieldErrors.gameDate) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין תאריך משחק תקין',
      errors: fieldErrors,
    }
  }

  if (fieldErrors.rivel) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין יריבה',
      errors: fieldErrors,
    }
  }

  if (fieldErrors.type) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור סוג משחק',
      errors: fieldErrors,
    }
  }

  if (fieldErrors.gameDuration) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור משך משחק',
      errors: fieldErrors,
    }
  }

  if (fieldErrors.home) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור בית / חוץ',
      errors: fieldErrors,
    }
  }

  return {
    valid,
    ok: valid,
    message: '',
    errors: fieldErrors,
  }
}

export function isTeamGameCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableTeamGameCreateDraft(draft)) !==
    JSON.stringify(buildComparableTeamGameCreateDraft(initial))
  )
}

export function buildTeamGameCreatePayload(draft = {}, context = {}) {
  const goalsFor = toNumOrZero(draft?.goalsFor)
  const goalsAgainst = toNumOrZero(draft?.goalsAgainst)

  return {
    gameDate: safe(draft?.gameDate),
    gameHour: safe(draft?.gameHour),
    rivel: safe(draft?.rivel),

    teamId: safe(draft?.teamId || context?.teamId || context?.team?.id),
    clubId: safe(
      draft?.clubId ||
        context?.clubId ||
        context?.team?.clubId ||
        context?.team?.club?.id
    ),

    home: toBool(draft?.home, true),
    difficulty: safe(draft?.difficulty),
    type: safe(draft?.type),
    gameDuration: safe(draft?.gameDuration),

    goalsFor,
    goalsAgainst,
    result: getGameResult({ goalsFor, goalsAgainst }),

    gamePlayers: Array.isArray(draft?.gamePlayers) ? draft.gamePlayers : [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function buildTeamGameCreateMeta(draft = {}, context = {}) {
  const validation = validateTeamGameCreateDraft(draft, context)

  return {
    title: 'משחק חדש',
    saveText: 'יצירת משחק',
    savingText: 'יוצר משחק...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
  }
}
