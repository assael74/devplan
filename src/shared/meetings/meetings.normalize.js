// src/shared/meetings/meetings.normalize.js
import { normalizeMeetingStatus, getStatusId } from './meetings.status.js'
import { MEETING_TYPES, MEETING_STATUSES } from './meetings.constants.js'

const FALLBACK_VIDEO =
  'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

const typeLabel = (type) => MEETING_TYPES?.find((t) => t.id === type)?.labelH || '—'
const statusLabel = (statusId) => MEETING_STATUSES?.find((s) => s.id === statusId)?.labelH || '—'

function safeStr(v) {
  return v == null ? '' : String(v)
}

function toMsFromDate(dateStr, timeStr) {
  if (!dateStr) return 0
  const iso = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`
  const d = new Date(iso)
  return Number.isFinite(d.getTime()) ? d.getTime() : 0
}

function toMonthKey(dateStr) {
  // YYYY-MM-DD -> MM-YYYY
  const s = safeStr(dateStr)
  if (!s || s.length < 10) return ''
  const yyyy = s.slice(0, 4)
  const mm = s.slice(5, 7)
  return mm && yyyy ? `${mm}-${yyyy}` : ''
}

export function adaptMeetingEntity(raw, idx = 0) {
  if (!raw) return null

  const id = safeStr(raw.id || idx)

  // מקור אמת
  const meetingDate = safeStr(raw.meetingDate || raw.date || '')
  const meetingHour = safeStr(raw.meetingHour || raw.time || '')
  const type = safeStr(raw.type || raw.typeId || '')
  const status = normalizeMeetingStatus(raw.status)
  const statusId = getStatusId(status)

  const _ms = toMsFromDate(meetingDate, meetingHour)
  const monthKey = toMonthKey(meetingDate)
  const isFuture = _ms ? _ms > Date.now() : false

  const notes = safeStr(raw.notes || '')
  const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => safeStr(t)).filter(Boolean) : []

  // ✅ חשוב: אל תקבע תמיד fallback; רק אם אין
  const videoId = safeStr(raw.videoId || raw.videoLink || '') || FALLBACK_VIDEO

  return {
    id,

    // source-of-truth fields
    title: safeStr(raw.title || ''),
    meetingDate,
    meetingHour,
    type,
    status,
    notes,
    tags,
    videoId,

    // derived (חדש)
    typeLabel: typeLabel(type),
    statusId,
    statusLabel: statusLabel(statusId),
    _ms,
    monthKey,
    isFuture,

    // ✅ backward-compat aliases למסך הכללי הישן
    date: meetingDate,
    time: meetingHour,
    typeId: type,

    raw,
  }
}

export function normalizeMeetings(list) {
  const arr = Array.isArray(list) ? list : []
  return arr.map((m, i) => adaptMeetingEntity(m, i)).filter(Boolean)
}
