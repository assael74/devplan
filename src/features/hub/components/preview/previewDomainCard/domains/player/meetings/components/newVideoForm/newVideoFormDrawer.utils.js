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

  const playerName = safe(player?.name) || `${safe(player?.playerFirstName)} ${safe(player?.playerLastName)}`.trim()

  const meetingDate = safe(meeting?.meetingDate)
  const meetingHour = safe(meeting?.meetingHour)

  return [playerName, 'וידאו', meetingDate, meetingHour].filter(Boolean).join(' • ')
}

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const meeting = context?.meeting || entity || null

  const playerId = safe(meeting?.player?.id)

  const meetingId = safe(context?.meetingId || meeting?.id)

  const year = safe(context?.year || getDefaultYear(context))
  const month = safe(context?.month || getDefaultMonth(context))

  return {
    contextType: 'meeting',
    objectType: 'meeting',
    playerId,
    meetingId,
    name: '',
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
        teamId: '',
      },
    }
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
