// previewDomainCard/domains/player/meetings/components/newVideoForm/newVideoFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const pad2 = (v) => String(v).padStart(2, '0')

const getDefaultYear = (context = {}) => {
  const date = context?.meeting?.meetingDate || context?.entity?.meetingDate || ''
  const yyyy = safe(date).slice(0, 4)

  if (yyyy) return yyyy
  return String(new Date().getFullYear())
}

const getDefaultMonth = (context = {}) => {
  const date = context?.meeting?.meetingDate || context?.entity?.meetingDate || ''
  const mm = safe(date).slice(5, 7)

  if (mm) return mm
  return pad2(new Date().getMonth() + 1)
}

const getDefaultName = (context = {}) => {
  const meeting = context?.meeting || context?.entity || null
  const player = context?.player || meeting?.player || null

  const playerName =
    safe(player?.playerFullName) ||
    safe(player?.name) ||
    `${safe(player?.playerFirstName)} ${safe(player?.playerLastName)}`.trim()

  const meetingDate = safe(meeting?.meetingDate)
  const meetingHour = safe(meeting?.meetingHour)

  return [playerName, 'וידאו', meetingDate, meetingHour].filter(Boolean).join(' • ')
}

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const meeting = context?.meeting || entity || null
  const player = context?.player || meeting?.player || null

  const playerId = safe(context?.playerId || player?.id)
  const teamId = safe(context?.teamId || player?.teamId || player?.team?.id)
  const clubId = safe(
    context?.clubId || player?.clubId || player?.club?.id || player?.club?.clubId
  )
  const meetingId = safe(context?.meetingId || meeting?.id)

  const year = safe(context?.year || getDefaultYear(context))
  const month = safe(context?.month || getDefaultMonth(context))

  return {
    contextType: 'meeting',
    objectType: 'meeting',
    playerId,
    teamId,
    clubId,
    meetingId,
    name: getDefaultName(context),
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

export function getValidity(draft = {}) {
  const name = safe(draft?.name)
  const link = safe(draft?.link)
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)
  const meetingId = safe(draft?.meetingId)
  const year = safe(draft?.year)
  const month = safe(draft?.month)

  const okName = !!name
  const okLink = !!link
  const okContextType = !!contextType
  const okObjectType = !!objectType
  const okMeetingId = !!meetingId
  const okYear = !!year
  const okMonth = !!month

  return {
    okName,
    okLink,
    okContextType,
    okObjectType,
    okMeetingId,
    okYear,
    okMonth,
    ok:
      okName &&
      okLink &&
      okContextType &&
      okObjectType &&
      okMeetingId &&
      okYear &&
      okMonth,
  }
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}

export function buildVideoAnalysisFieldConfig(draft = {}, context = {}) {
  const locks = draft?.__locks || {}

  const contextType = draft?.contextType || ''
  const objectType = draft?.objectType || ''

  const isMeetingMode = contextType === 'meeting'
  const isEntityMode = contextType === 'entity'

  const visible = {
    showMeetingField: isMeetingMode,
    showPlayerField: objectType === 'player',
    showTeamField: objectType === 'team',
  }

  const disabled = {
    disableObjectType: !!locks?.lockObjectType,
    disableMeeting: !!locks?.lockMeetingId,
    disablePlayer: !!locks?.lockPlayerId,
    disableTeam: !!locks?.lockTeamId,
  }

  const contextTypeOptions = [{ value: 'meeting', label: 'פגישה' }]
  const objectTypeOptions = [{ value: 'meeting', label: 'פגישה' }]

  return {
    locks,
    visible,
    disabled,
    isMeetingMode,
    isEntityMode,
    contextTypeOptions,
    objectTypeOptions,
    context,
  }
}
