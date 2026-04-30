const safe = (v) => (v == null ? '' : String(v).trim())

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

function buildComparableMeetingCreateDraft(draft = {}) {
  return {
    meetingDate: safe(draft?.meetingDate),
    meetingHour: safe(draft?.meetingHour),
    meetingFor: safe(draft?.meetingFor),
    playerId: safe(draft?.playerId),
    teamId: safe(draft?.teamId),
    clubId: safe(draft?.clubId),
    type: safe(draft?.type),
  }
}

export function buildMeetingCreateDraft(context = {}) {
  const entity = context?.entity || null
  const player = context?.player || entity || null
  const team = context?.team || player?.team || null

  const playerId = safe(context?.playerId || player?.id)
  const teamId = safe(context?.teamId || team?.id || player?.teamId)
  const clubId = safe(
    context?.clubId ||
      team?.clubId ||
      team?.club?.id ||
      player?.clubId ||
      player?.club?.id ||
      player?.club?.clubId
  )

  return {
    meetingDate: '',
    meetingHour: '',
    meetingFor: '',
    playerId,
    teamId,
    clubId,
    type: '',
  }
}

export function getMeetingCreateValidity(draft = {}) {
  const type = safe(draft?.type)
  const meetingDate = safe(draft?.meetingDate)
  const meetingFor = safe(draft?.meetingFor)

  return {
    okType: !!type,
    okDate: !!meetingDate && isValidDateFormat(meetingDate),
    okFor: !!meetingFor,
  }
}

export function validateMeetingCreateDraft(draft = {}) {
  const validity = getMeetingCreateValidity(draft)

  const errors = {
    type: !validity.okType,
    meetingDate: !validity.okDate,
    meetingFor: !validity.okFor,
  }

  const valid = Boolean(validity.okType && validity.okDate && validity.okFor)

  if (errors.type) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור סוג פגישה',
      errors,
      validity,
    }
  }

  if (errors.meetingDate) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין תאריך פגישה תקין',
      errors,
      validity,
    }
  }

  if (errors.meetingFor) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין עבור מי הפגישה',
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

export function isMeetingCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableMeetingCreateDraft(draft)) !==
    JSON.stringify(buildComparableMeetingCreateDraft(initial))
  )
}

export function buildMeetingCreatePayload(draft = {}, context = {}) {
  const createdAt = Date.now()

  return {
    meetingDate: safe(draft?.meetingDate),
    meetingHour: safe(draft?.meetingHour),
    meetingFor: safe(draft?.meetingFor),
    type: safe(draft?.type),

    playerId: safe(draft?.playerId || context?.playerId || context?.player?.id),
    teamId: safe(
      draft?.teamId ||
        context?.teamId ||
        context?.team?.id ||
        context?.player?.teamId ||
        context?.player?.team?.id
    ),
    clubId: safe(
      draft?.clubId ||
        context?.clubId ||
        context?.team?.clubId ||
        context?.player?.clubId
    ),

    status: {
      id: 'new',
      time: createdAt,
    },

    createdAt,
    updatedAt: createdAt,
  }
}

export function buildMeetingCreateMeta(draft = {}, context = {}) {
  const validation = validateMeetingCreateDraft(draft, context)

  return {
    title: 'פגישה חדשה',
    saveText: 'יצירת פגישה',
    savingText: 'יוצר פגישה...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
    validity: validation.validity,
  }
}
