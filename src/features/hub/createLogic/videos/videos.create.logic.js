const safe = (v) => (v == null ? '' : String(v).trim())
const pad2 = (v) => String(v).padStart(2, '0')

const getCurrentYear = () => String(new Date().getFullYear())
const getCurrentMonth = () => pad2(new Date().getMonth() + 1)

const getDefaultYearFromMeeting = (context = {}) => {
  const date = context?.meeting?.meetingDate || context?.entity?.meetingDate || ''
  const yyyy = safe(date).slice(0, 4)

  if (yyyy) return yyyy
  return getCurrentYear()
}

const getDefaultMonthFromMeeting = (context = {}) => {
  const date = context?.meeting?.meetingDate || context?.entity?.meetingDate || ''
  const mm = safe(date).slice(5, 7)

  if (mm) return mm
  return getCurrentMonth()
}

const getPlayerName = (player = {}) => {
  const fullName = safe(player?.playerFullName) || safe(player?.name)
  if (fullName) return fullName

  return `${safe(player?.playerFirstName)} ${safe(player?.playerLastName)}`.trim()
}

const getDefaultMeetingVideoName = (context = {}) => {
  const meeting = context?.meeting || context?.entity || null
  const player = context?.player || meeting?.player || null

  const playerName = getPlayerName(player)
  const meetingDate = safe(meeting?.meetingDate)
  const meetingHour = safe(meeting?.meetingHour)

  return [playerName, 'וידאו', meetingDate, meetingHour].filter(Boolean).join(' • ')
}

function buildComparableVideoCreateDraft(draft = {}) {
  return {
    name: safe(draft?.name),
    link: safe(draft?.link),
    contextType: safe(draft?.contextType),
    objectType: safe(draft?.objectType),
    year: safe(draft?.year),
    month: safe(draft?.month),
    meetingId: safe(draft?.meetingId),
    teamId: safe(draft?.teamId),
    playerId: safe(draft?.playerId),
    clubId: safe(draft?.clubId),
  }
}

export function buildPlayerVideoCreateDraft(context = {}) {
  const player = context?.player || context?.entity || null
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
    name: '',
    link: '',
    contextType: playerId ? 'entity' : '',
    objectType: playerId ? 'player' : '',
    year: getCurrentYear(),
    month: getCurrentMonth(),
    meetingId: '',
    teamId: teamId || '',
    playerId: playerId || '',
    clubId: clubId || '',
    __locks: playerId
      ? {
          lockContextType: true,
          lockObjectType: true,
          lockTeamId: true,
          lockPlayerId: true,
          expected: {
            contextType: 'entity',
            objectType: 'player',
            playerId,
            teamId,
          },
        }
      : {},
  }
}

export function buildTeamVideoCreateDraft(context = {}) {
  const team = context?.team || context?.entity || null

  const teamId = safe(context?.teamId || team?.id)
  const clubId = safe(
    context?.clubId ||
      team?.clubId ||
      team?.club?.id ||
      team?.club?.clubId
  )

  return {
    name: '',
    link: '',
    contextType: teamId ? 'entity' : '',
    objectType: teamId ? 'team' : '',
    year: getCurrentYear(),
    month: getCurrentMonth(),
    meetingId: '',
    teamId: teamId || '',
    playerId: '',
    clubId: clubId || '',
    __locks: teamId
      ? {
          lockContextType: true,
          lockObjectType: true,
          lockTeamId: true,
          expected: {
            contextType: 'entity',
            objectType: 'team',
            teamId,
          },
        }
      : {},
  }
}

export function buildMeetingVideoCreateDraft(context = {}) {
  const entity = context?.entity || null
  const meeting = context?.meeting || entity || null
  const player = context?.player || meeting?.player || null

  const playerId = safe(context?.playerId || player?.id)
  const teamId = safe(context?.teamId || player?.teamId || player?.team?.id)
  const clubId = safe(
    context?.clubId || player?.clubId || player?.club?.id || player?.club?.clubId
  )
  const meetingId = safe(context?.meetingId || meeting?.id)

  const year = safe(context?.year || getDefaultYearFromMeeting(context))
  const month = safe(context?.month || getDefaultMonthFromMeeting(context))

  return {
    contextType: 'meeting',
    objectType: 'meeting',
    playerId,
    teamId,
    clubId,
    meetingId,
    name: getDefaultMeetingVideoName(context),
    link: safe(context?.link),
    year,
    month,
    __locks: {
      lockContextType: true,
      lockObjectType: true,
      lockMeetingId: true,
      lockPlayerId: true,
      lockTeamId: true,
      expected: {
        contextType: 'meeting',
        objectType: 'meeting',
        meetingId,
        playerId,
        teamId,
      },
    },
  }
}

export function buildVideoCreateDraft(context = {}) {
  const mode = safe(context?.mode || context?.createMode)

  if (mode === 'meeting' || context?.meeting || context?.meetingId) {
    return buildMeetingVideoCreateDraft(context)
  }

  if (mode === 'team' || context?.team || context?.teamId) {
    return buildTeamVideoCreateDraft(context)
  }

  return buildPlayerVideoCreateDraft(context)
}

export function getVideoCreateValidity(draft = {}) {
  const name = safe(draft?.name)
  const link = safe(draft?.link)
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)
  const meetingId = safe(draft?.meetingId)
  const year = safe(draft?.year)
  const month = safe(draft?.month)
  const playerId = safe(draft?.playerId)
  const teamId = safe(draft?.teamId)

  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  const okName = !!name
  const okLink = !!link
  const okContextType = !!contextType
  const okObjectType = !!objectType
  const okMeeting = !isMeetingMode || !!meetingId
  const okYear = !!year
  const okMonth = !!month
  const okPlayer = !(isEntityMode && objectType === 'player') || !!playerId
  const okTeam = !(isEntityMode && objectType === 'team') || !!teamId

  return {
    okName,
    okLink,
    okContextType,
    okObjectType,
    okMeeting,
    okYear,
    okMonth,
    okPlayer,
    okTeam,
    ok:
      okName &&
      okLink &&
      okContextType &&
      okObjectType &&
      okMeeting &&
      okYear &&
      okMonth &&
      okPlayer &&
      okTeam,
  }
}

export function validateVideoCreateDraft(draft = {}) {
  const validity = getVideoCreateValidity(draft)

  const errors = {
    name: !validity.okName,
    link: !validity.okLink,
    contextType: !validity.okContextType,
    objectType: !validity.okObjectType,
    meetingId: !validity.okMeeting,
    year: !validity.okYear,
    month: !validity.okMonth,
    playerId: !validity.okPlayer,
    teamId: !validity.okTeam,
  }

  if (errors.name) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין שם וידאו',
      errors,
      validity,
    }
  }

  if (errors.link) {
    return {
      valid: false,
      ok: false,
      message: 'יש להזין קישור וידאו',
      errors,
      validity,
    }
  }

  if (errors.contextType) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור הקשר וידאו',
      errors,
      validity,
    }
  }

  if (errors.objectType) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור סוג אובייקט',
      errors,
      validity,
    }
  }

  if (errors.meetingId) {
    return {
      valid: false,
      ok: false,
      message: 'חסרה פגישה',
      errors,
      validity,
    }
  }

  if (errors.year || errors.month) {
    return {
      valid: false,
      ok: false,
      message: 'יש לבחור שנה וחודש',
      errors,
      validity,
    }
  }

  if (errors.playerId) {
    return {
      valid: false,
      ok: false,
      message: 'חסר שחקן',
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

  return {
    valid: validity.ok,
    ok: validity.ok,
    message: '',
    errors,
    validity,
  }
}

export function isVideoCreateDirty(draft = {}, initial = {}) {
  return (
    JSON.stringify(buildComparableVideoCreateDraft(draft)) !==
    JSON.stringify(buildComparableVideoCreateDraft(initial))
  )
}

export function buildVideoCreatePayload(draft = {}, context = {}) {
  const createdAt = Date.now()

  return {
    name: safe(draft?.name),
    link: safe(draft?.link),

    contextType: safe(draft?.contextType),
    objectType: safe(draft?.objectType),

    year: safe(draft?.year),
    month: safe(draft?.month),

    meetingId: safe(draft?.meetingId),
    teamId: safe(draft?.teamId || context?.teamId || context?.team?.id),
    playerId: safe(draft?.playerId || context?.playerId || context?.player?.id),
    clubId: safe(
      draft?.clubId ||
        context?.clubId ||
        context?.team?.clubId ||
        context?.player?.clubId
    ),

    createdAt,
    updatedAt: createdAt,
  }
}

export function buildVideoAnalysisFieldConfig(draft = {}, context = {}) {
  const locks = draft?.__locks || {}

  const contextType = draft?.contextType || ''
  const objectType = draft?.objectType || ''

  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  const visible = {
    showMeetingField: isMeetingMode,
    showPlayerField: isEntityMode && objectType === 'player',
    showTeamField: isEntityMode && objectType === 'team',
  }

  const disabled = {
    disableObjectType: !!locks?.lockObjectType,
    disableMeeting: !!locks?.lockMeetingId,
    disablePlayer: !!locks?.lockPlayerId,
    disableTeam: !!locks?.lockTeamId,
  }

  const contextTypeOptions = [
    { value: 'entity', label: 'ישות' },
    { value: 'meeting', label: 'פגישה' },
  ]

  const objectTypeOptions = isMeetingMode
    ? [{ value: 'meeting', label: 'פגישה' }]
    : [
        { value: 'player', label: 'שחקן' },
        { value: 'team', label: 'קבוצה' },
      ]

  return {
    locks,
    visible,
    disabled,
    isMeetingMode,
    isEntityMode,
    objectTypeOptions,
    contextTypeOptions,
    context,
  }
}

export function buildVideoCreateMeta(draft = {}, context = {}) {
  const validation = validateVideoCreateDraft(draft, context)

  return {
    title: 'וידאו חדש',
    saveText: 'יצירת וידאו',
    savingText: 'יוצר וידאו...',
    valid: validation.valid,
    ok: validation.ok,
    message: validation.message,
    errors: validation.errors,
    validity: validation.validity,
  }
}
