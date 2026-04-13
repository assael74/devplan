// previewDomainCard/domains/player/meetings/components/drawer/editDrawer.utils.js

import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

const isValidDateFormat = (value) => {
  const date = clean(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export const getMeetingStatusId = (status) => {
  if (!status) return ''
  if (typeof status === 'string') return status.trim()

  if (typeof status === 'object') {
    return clean(status?.current?.id || status?.id)
  }

  return ''
}

export const buildMeetingStatusObject = (prevStatus, nextStatusId) => {
  const cleanNext = clean(nextStatusId)
  if (!cleanNext) return null

  const now = Date.now()

  if (prevStatus && typeof prevStatus === 'object') {
    const prevHistory = Array.isArray(prevStatus?.history) ? prevStatus.history : []
    const prevCurrentId = clean(prevStatus?.current?.id || prevStatus?.id)

    if (prevCurrentId === cleanNext) {
      return {
        ...prevStatus,
        current: {
          ...(prevStatus?.current || {}),
          id: cleanNext,
          time: prevStatus?.current?.time || now,
        },
        history: prevHistory,
      }
    }

    return {
      current: {
        id: cleanNext,
        time: now,
      },
      history: [
        ...prevHistory,
        {
          id: cleanNext,
          time: now,
        },
      ],
    }
  }

  const prevFlat = typeof prevStatus === 'string' ? prevStatus.trim() : ''
  const history = []

  if (prevFlat) {
    history.push({
      id: prevFlat,
      time: now,
    })
  }

  history.push({
    id: cleanNext,
    time: now,
  })

  return {
    current: {
      id: cleanNext,
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
  const playerName = `${meeting?.player?.playerFirstName || ''} ${meeting?.player?.playerLastName || ''}`.trim()
  const rawDate = clean(meeting?.meetingDate)
  const dateLabel = clean(meeting?.dateLabel) || clean(getFullDateIl(rawDate))
  const hour = clean(meeting?.meetingHour)

  return [playerName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי פגישה'
}

export const buildInitialDraft = (meeting = {}) => {
  const source = meeting || {}
  const linkedVideo = source?.video || null

  return {
    id: source?.id || '',
    playerId: source?.playerId || source?.player?.id || '',
    name: buildMeetingName(source),
    meetingDate: source?.meetingDate || '',
    meetingHour: source?.meetingHour || '',
    meetingFor: source?.meetingFor || '',
    type: source?.type || '',
    statusId: getMeetingStatusId(source?.status),
    notes: source?.notes || '',

    videoId: linkedVideo?.id || '',
    rawVideoId: linkedVideo?.id || '',
    rawVideoInfo: linkedVideo?.videoInfo || null,
    rawVideo: linkedVideo || null,

    raw: source,
    metaLabel: buildMeetingMeta(source),
  }
}

export const getFieldErrors = (draft = {}) => {
  const meetingDate = clean(draft?.meetingDate)
  const type = clean(draft?.type)
  const meetingFor = clean(draft?.meetingFor)

  return {
    okType: !!type,
    okDate: !!meetingDate && isValidDateFormat(meetingDate),
    okFor: !!meetingFor,
  }
}

export const getIsValid = (draft = {}) => {
  const validity = getFieldErrors(draft)
  return Boolean(validity.okType && validity.okDate && validity.okFor)
}

export const buildMeetingPatch = (initial, draft) => {
  const next = {}

  if ((draft?.meetingDate || '') !== (initial?.meetingDate || '')) {
    next.meetingDate = draft?.meetingDate || ''
  }

  if ((draft?.meetingHour || '') !== (initial?.meetingHour || '')) {
    next.meetingHour = draft?.meetingHour || ''
  }

  if ((draft?.meetingFor || '') !== (initial?.meetingFor || '')) {
    next.meetingFor = draft?.meetingFor || ''
  }

  if ((draft?.type || '') !== (initial?.type || '')) {
    next.type = draft?.type || ''
  }

  if ((draft?.statusId || '') !== (initial?.statusId || '')) {
    next.status = buildMeetingStatusObject(initial?.raw?.status, draft?.statusId)
  }

  if ((draft?.notes || '') !== (initial?.notes || '')) {
    next.notes = draft?.notes || ''
  }

  return next
}

export const buildVideoPlan = (initial, draft) => {
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

export const buildPatch = (initial, draft) => {
  return {
    meetingPatch: buildMeetingPatch(initial, draft),
    videoPlan: buildVideoPlan(initial, draft),
  }
}

export const getIsDirty = (initial, draft) => {
  const { meetingPatch, videoPlan } = buildPatch(initial, draft)

  return (
    Object.keys(meetingPatch).length > 0 ||
    !!videoPlan?.unlinkPrev ||
    !!videoPlan?.linkNext
  )
}
