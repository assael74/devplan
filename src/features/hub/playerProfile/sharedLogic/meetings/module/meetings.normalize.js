// playerProfile/sharedLogic/meetings/module/meetings.normalize.js

import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../shared/meetings/meetings.constants.js'
import {
  toKey,
  getMonthKey,
  meetingMs,
  getTimeUntilMs,
  timeAgoFromMs,
  normalizeDateIL,
} from './meetings.utils.js'

function buildIdMaps() {
  const statusById = {}
  const statusByHeb = {}

  for (const s of MEETING_STATUSES || []) {
    statusById[toKey(s.id)] = s
    statusByHeb[toKey(s.labelH)] = s
  }

  const typeById = {}
  const typeByHeb = {}

  for (const t of MEETING_TYPES || []) {
    typeById[toKey(t.id)] = t
    typeByHeb[toKey(t.labelH)] = t
  }

  return { statusById, statusByHeb, typeById, typeByHeb }
}

const { statusById, statusByHeb, typeById, typeByHeb } = buildIdMaps()

function resolveStatusId(rawStatus) {
  if (!rawStatus) return ''

  if (typeof rawStatus === 'object') {
    const currentId = rawStatus?.current?.id || rawStatus?.id || ''
    return toKey(currentId)
  }

  const key = toKey(rawStatus)
  if (statusById[key]) return statusById[key].id
  if (statusByHeb[key]) return statusByHeb[key].id
  return rawStatus
}

function resolveTypeId(rawType) {
  if (!rawType) return ''

  const key = toKey(rawType)
  if (typeById[key]) return typeById[key].id
  if (typeByHeb[key]) return typeByHeb[key].id
  return rawType
}

function labelFromId(kind, value) {
  const key = toKey(value)

  if (kind === 'status') return statusById[key]?.labelH || String(value || '')
  if (kind === 'type') return typeById[key]?.labelH || String(value || '')
  return String(value || '')
}

function buildDedupeKey(item) {
  const raw = item?.raw || {}
  const eventId = raw?.eventId || item?.eventId
  if (eventId) return `event:${String(eventId)}`

  const date = String(item?.meetingDate || item?.date || '')
  const time = String(item?.meetingHour || item?.time || '')
  const type = String(item?.typeId || item?.type || '')
  return `dt:${date}|${time}|${type}`
}

function dedupeMeetings(items) {
  const seen = new Set()
  const out = []

  for (const item of items) {
    if (!item) continue

    const key = buildDedupeKey(item)
    if (seen.has(key)) continue

    seen.add(key)
    out.push(item)
  }

  return out
}

export function normalizeMeetings(rawList) {
  const arr = Array.isArray(rawList) ? rawList : []
  if (!arr.length) return []

  const normalized = arr.map((m, idx) => {
    const rawDate = m?.meetingDate || m?.date || ''
    const rawHour = m?.meetingHour || m?.time || ''
    const statusId = resolveStatusId(m?.status || m?.statusId)
    const typeId = resolveTypeId(m?.type ?? m?.typeId)

    const meetingDate = normalizeDateIL(rawDate)
    const ms = meetingMs(rawDate, rawHour)
    const isFuture = Number.isFinite(ms) ? ms > Date.now() : false

    const until = isFuture ? getTimeUntilMs(ms) : null
    const ago = !isFuture && Number.isFinite(ms) ? timeAgoFromMs(ms) : null

    return {
      id: String(m?.id ?? idx),
      raw: m,

      meetingDate,
      meetingHour: rawHour,
      notes: String(m?.notes || '').trim(),

      type: typeId,
      typeId,
      typeLabel: labelFromId('type', typeId || m?.type),

      statusId,
      statusLabel: labelFromId('status', statusId || m?.status),

      videoId: m?.videoId || '',
      videoLink: m?.videoLink || '',

      monthKey: getMonthKey(rawDate || meetingDate),
      ms,
      isFuture,
      timeLabel: until || ago || null,
    }
  })

  return dedupeMeetings(normalized)
}
