// features/hub/editLogic/meetings/meetingEdit.model.js

import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))
export const clean = (value) => safe(value).trim()

const isValidDateFormat = (value) => {
  const date = clean(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export const getMeetingStatusId = (status) => {
  if (!status) return ''
  if (typeof status === 'string') return clean(status)

  if (typeof status === 'object') {
    return clean(status?.current?.id || status?.id)
  }

  return ''
}

export const buildMeetingStatusObject = (prevStatus, nextStatusId) => {
  const nextId = clean(nextStatusId)
  if (!nextId) return null

  const now = Date.now()

  if (prevStatus && typeof prevStatus === 'object') {
    const prevHistory = Array.isArray(prevStatus?.history) ? prevStatus.history : []
    const prevCurrentId = clean(prevStatus?.current?.id || prevStatus?.id)

    if (prevCurrentId === nextId) {
      return {
        ...prevStatus,
        current: {
          ...(prevStatus?.current || {}),
          id: nextId,
          time: prevStatus?.current?.time || now,
        },
        history: prevHistory,
      }
    }

    return {
      current: {
        id: nextId,
        time: now,
      },
      history: [
        ...prevHistory,
        {
          id: nextId,
          time: now,
        },
      ],
    }
  }

  const prevFlat = typeof prevStatus === 'string' ? clean(prevStatus) : ''
  const history = []

  if (prevFlat) {
    history.push({
      id: prevFlat,
      time: now,
    })
  }

  history.push({
    id: nextId,
    time: now,
  })

  return {
    current: {
      id: nextId,
      time: now,
    },
    history,
  }
}

export const buildMeetingName = (meeting = {}) => {
  const date = clean(meeting?.meetingDate)
  const hour = clean(meeting?.meetingHour)
  const type = clean(meeting?.typeLabel || meeting?.type)
  const meetingFor = clean(meeting?.meetingFor)

  return [type, meetingFor, date, hour].filter(Boolean).join(' • ') || 'פגישה'
}

export const buildMeetingMeta = (meeting = {}) => {
  const playerName = [meeting?.player?.playerFirstName, meeting?.player?.playerLastName]
    .map(clean)
    .filter(Boolean)
    .join(' ')

  const rawDate = clean(meeting?.meetingDate)
  const dateLabel = clean(meeting?.dateLabel) || clean(getFullDateIl(rawDate))
  const hour = clean(meeting?.meetingHour)

  return [playerName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי פגישה'
}

export const buildMeetingEditInitial = (meeting = {}) => {
  const source = meeting?.raw || meeting?.meeting || meeting || {}
  const linkedVideo = source?.video || null

  return {
    id: clean(source?.id || source?.meetingId),
    playerId: clean(source?.playerId || source?.player?.id),

    name: buildMeetingName(source),

    meetingDate: clean(source?.meetingDate || source?.date),
    meetingHour: clean(source?.meetingHour || source?.time),
    meetingFor: clean(source?.meetingFor),
    type: clean(source?.type),
    statusId: getMeetingStatusId(source?.status),
    notes: clean(source?.notes),

    videoId: clean(source?.videoId || linkedVideo?.id),
    rawVideoId: clean(linkedVideo?.id || source?.videoId),
    rawVideoInfo: linkedVideo?.videoInfo || null,
    rawVideo: linkedVideo || null,

    raw: source,
    metaLabel: buildMeetingMeta(source),
  }
}

export const getMeetingEditFieldErrors = (draft = {}) => {
  const meetingDate = clean(draft?.meetingDate)
  const type = clean(draft?.type)
  const meetingFor = clean(draft?.meetingFor)

  return {
    meetingDate: !meetingDate || !isValidDateFormat(meetingDate),
    type: !type,
    meetingFor: !meetingFor,
  }
}

export const getIsMeetingEditValid = (draft = {}) => {
  return !Object.values(getMeetingEditFieldErrors(draft)).some(Boolean)
}

export const buildMeetingEditPatch = (draft = {}, initial = {}) => {
  const next = {}

  if (clean(draft?.meetingDate) !== clean(initial?.meetingDate)) {
    next.meetingDate = clean(draft?.meetingDate)
  }

  if (clean(draft?.meetingHour) !== clean(initial?.meetingHour)) {
    next.meetingHour = clean(draft?.meetingHour)
  }

  if (clean(draft?.meetingFor) !== clean(initial?.meetingFor)) {
    next.meetingFor = clean(draft?.meetingFor)
  }

  if (clean(draft?.type) !== clean(initial?.type)) {
    next.type = clean(draft?.type)
  }

  if (clean(draft?.statusId) !== clean(initial?.statusId)) {
    next.status = buildMeetingStatusObject(initial?.raw?.status, draft?.statusId)
  }

  if (clean(draft?.notes) !== clean(initial?.notes)) {
    next.notes = clean(draft?.notes)
  }

  return next
}

export const buildMeetingVideoPlan = (draft = {}, initial = {}) => {
  const initialVideoId = clean(initial?.rawVideoId)
  const nextVideoId = clean(draft?.videoId)

  if (initialVideoId === nextVideoId) {
    return {
      unlinkPrev: null,
      linkNext: null,
    }
  }

  const meetingId = clean(initial?.id || initial?.raw?.id)
  const playerId = clean(initial?.raw?.playerId || initial?.raw?.player?.id)

  const unlinkPrev =
    initialVideoId && initial?.rawVideoInfo
      ? {
          videoId: initialVideoId,
          videoInfo: initial.rawVideoInfo,
          patch: {
            contextType: 'floating',
            objectType: null,
            meetingId: null,
            playerId: null,
          },
        }
      : null

  const linkNext = nextVideoId
    ? {
        videoId: nextVideoId,
        patch: {
          contextType: 'meeting',
          objectType: 'meeting',
          meetingId,
          playerId,
        },
      }
    : null

  return {
    unlinkPrev,
    linkNext,
  }
}

export const buildMeetingEditBundle = (draft = {}, initial = {}) => {
  return {
    meetingPatch: buildMeetingEditPatch(draft, initial),
    videoPlan: buildMeetingVideoPlan(draft, initial),
  }
}

export const isMeetingEditDirty = (draft = {}, initial = {}) => {
  const { meetingPatch, videoPlan } = buildMeetingEditBundle(draft, initial)

  return (
    Object.keys(meetingPatch).length > 0 ||
    Boolean(videoPlan?.unlinkPrev) ||
    Boolean(videoPlan?.linkNext)
  )
}
