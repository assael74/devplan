const safe = (v) => (v == null ? '' : String(v).trim())

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

function buildComparablePlayerCreateDraft(draft = {}) {
  return {
    playerFirstName: safe(draft?.playerFirstName),
    playerLastName: safe(draft?.playerLastName),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),
    birth: safe(draft?.birth),
  }
}

export function buildPlayerCreateDraft(context = {}) {
  const team = context?.team || null
  const teamId = safe(context?.teamId || team?.id)
  const clubId = safe(context?.clubId || team?.clubId || team?.club?.id)

  return {
    playerFirstName: '',
    playerLastName: '',
    teamId,
    clubId,
    birth: '',
  }
}

export function getPlayerCreateValidity(draft = {}) {
  const playerFirstName = safe(draft?.playerFirstName)
  const playerLastName = safe(draft?.playerLastName)
  const teamId = safe(draft?.teamId)
  const clubId = safe(draft?.clubId)
  const birth = safe(draft?.birth)

  return {
    okFirstName: !!playerFirstName,
    okLastName: !!playerLastName,
    okTeamId: !!teamId,
    okClubId: !!clubId,
    okBirth: !birth || isValidDateFormat(birth),
  }
}

export function validatePlayerCreateDraft(draft = {}) {
  const validity = getPlayerCreateValidity(draft)

  const errors = {
    playerFirstName: !validity.okFirstName,
    playerLastName: !validity.okLastName,
    teamId: !validity.okTeamId,
    clubId: !validity.okClubId,
    birth: !validity.okBirth,
  }

  const valid = Boolean(
    validity.okFirstName &&
      validity.okLastName &&
      validity.okTeamId &&
      validity.okClubId &&
      validity.okBirth
  )

  if (errors.playerFirstName) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין שם פרטי',
      errors,
      validity,
    }
  }

  if (errors.playerLastName) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין שם משפחה',
      errors,
      validity,
    }
  }

  if (errors.teamId) {
    return {
      valid: false,
      ok: false,
      message: 'חסרה קבוצה',
      errors,
      validity,
    }
  }

  if (errors.clubId) {
    return {
      valid: false,
      ok: false,
      message: 'חסר מועדון',
      errors,
      validity,
    }
  }

  if (errors.birth) {
    return {
      valid: false,
      ok: false,
      message: 'תאריך הלידה אינו תקין',
      errors,
      validity,
    }
  }

  return {
    valid,
    ok: valid,
    message: '',
    errors,
    validity,
  }
}

export function isPlayerCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparablePlayerCreateDraft(draft)) !==
    JSON.stringify(buildComparablePlayerCreateDraft(initial))
  )
}

export function buildPlayerCreatePayload(draft = {}, context = {}) {
  const createdAt = Date.now()

  const playerFirstName = safe(draft?.playerFirstName)
  const playerLastName = safe(draft?.playerLastName)

  return {
    playerFirstName,
    playerLastName,
    playerFullName: [playerFirstName, playerLastName].filter(Boolean).join(' '),

    teamId: safe(draft?.teamId || context?.teamId || context?.team?.id),
    clubId: safe(
      draft?.clubId ||
        context?.clubId ||
        context?.team?.clubId ||
        context?.team?.club?.id
    ),

    birth: safe(draft?.birth),

    active: true,
    projectPlayer: true,

    createdAt,
    updatedAt: createdAt,
  }
}

export function buildPlayerCreateMeta(draft = {}, context = {}) {
  const validation = validatePlayerCreateDraft(draft, context)

  return {
    title: 'שחקן חדש',
    saveText: 'יצירת שחקן',
    savingText: 'יוצר שחקן...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
    validity: validation.validity,
  }
}
