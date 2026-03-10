// previewDomainCard/domains/player/meetings/components/drawer/editDrawer.utils.js

import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'

export const safe = (v) => (v == null ? '' : String(v))

export const toNumOrEmpty = (v) => {
  if (v === '' || v == null) return ''
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}

export const buildMeetingName = (meeting) => {
  const typeLabel =
    safe(meeting?.typeLabel).trim() ||
    safe(meeting?.meetingTypeLabel).trim() ||
    safe(meeting?.title).trim() ||
    safe(meeting?.type).trim()

  const date =
    safe(meeting?.meetingDate).trim() ||
    safe(meeting?.dateRaw).trim() ||
    safe(meeting?.date).trim()

  return [typeLabel, date].filter(Boolean).join(' • ') || 'פגישה'
}

export const buildMeetingMeta = (meeting) => {
  const playerName =
    safe(meeting?.playerName).trim() ||
    safe(meeting?.player?.name).trim() ||
    safe(meeting?.player?.fullName).trim()

  const rawDate =
    safe(meeting?.meetingDate).trim() ||
    safe(meeting?.dateRaw).trim() ||
    safe(meeting?.date).trim()

  const dateLabel =
    safe(meeting?.dateLabel).trim() ||
    safe(getFullDateIl(rawDate)).trim()

  const hour =
    safe(meeting?.meetingHour).trim() ||
    safe(meeting?.hourRaw).trim() ||
    safe(meeting?.hour).trim()

  return [playerName, dateLabel, hour].filter(Boolean).join(' | ') || 'פרטי פגישה'
}

export const buildInitialDraft = (meeting) => {
  const m = meeting || {}
  const source = m?.meeting || m || {}

  return {
    id: source?.id || m?.id || m?.meetingId || '',
    name: buildMeetingName(source),
    photo:
      source?.photo ||
      source?.playerPhoto ||
      source?.player?.photo ||
      '',
    playerName:
      source?.playerName ||
      source?.player?.name ||
      source?.player?.fullName ||
      '',
    meetingDate: source?.meetingDate || source?.dateRaw || source?.date || '',
    meetingHour: source?.meetingHour || source?.hourRaw || source?.hour || '',
    type: source?.type || '',
    status: source?.status || '',
    meetingFor: source?.meetingFor || '',
    videoLink: source?.videoLink || source?.vLink || '',
    notes:
      source?.notes ||
      source?.summary ||
      '',
    raw: source,
    metaLabel: buildMeetingMeta(source),
  }
}

export const buildPatch = (draft, initial) => {
  const next = {}

  if (draft.meetingDate !== initial.meetingDate) {
    next.meetingDate = draft.meetingDate || ''
  }

  if (draft.meetingHour !== initial.meetingHour) {
    next.meetingHour = draft.meetingHour || ''
  }

  if (draft.type !== initial.type) {
    next.type = draft.type || ''
  }

  if (draft.status !== initial.status) {
    next.status = draft.status || ''
  }

  if (draft.meetingFor !== initial.meetingFor) {
    next.meetingFor = draft.meetingFor || ''
  }

  if (draft.videoLink !== initial.videoLink) {
    next.videoLink = draft.videoLink || ''
  }

  if (draft.notes !== initial.notes) {
    next.notes = draft.notes || ''
  }

  return next
}

export const getIsDirty = (draft, initial) =>
  draft.meetingDate !== initial.meetingDate ||
  draft.meetingHour !== initial.meetingHour ||
  draft.type !== initial.type ||
  draft.status !== initial.status ||
  draft.meetingFor !== initial.meetingFor ||
  draft.videoLink !== initial.videoLink ||
  draft.notes !== initial.notes
