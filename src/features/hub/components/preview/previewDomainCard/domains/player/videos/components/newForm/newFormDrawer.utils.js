// previewDomainCard/domains/Player/videos/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())
const pad2 = (v) => String(v).padStart(2, '0')

export function buildInitialDraft(context = {}) {
  const player = context?.player || null
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
    year: String(new Date().getFullYear()),
    month: pad2(new Date().getMonth() + 1),
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

export function getValidity(draft = {}) {
  const name = safe(draft?.name)
  const link = safe(draft?.link)
  const contextType = safe(draft?.contextType)
  const objectType = safe(draft?.objectType)
  const year = safe(draft?.year)
  const month = safe(draft?.month)

  const okName = !!name
  const okLink = !!link
  const okContextType = !!contextType
  const okObjectType = !!objectType
  const okYear = !!year
  const okMonth = !!month

  const okPlayer =
    objectType !== 'player' || !!safe(draft?.playerId)

  const okTeam =
    objectType !== 'team' || !!safe(draft?.teamId)

  return {
    okName,
    okLink,
    okContextType,
    okObjectType,
    okYear,
    okMonth,
    okPlayer,
    okTeam,
    ok:
      okName &&
      okLink &&
      okContextType &&
      okObjectType &&
      okYear &&
      okMonth &&
      okPlayer &&
      okTeam,
  }
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}

export function buildVideoAnalysisFieldConfig(draft = {}) {
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
  }
}
