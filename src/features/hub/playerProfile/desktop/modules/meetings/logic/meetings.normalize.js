// features/hub/playerProfile/modules/meetings/logic/meetings.normalize.js

import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../shared/meetings/meetings.constants.js'
import { toKey, getMonthKey, meetingMs, getTimeUntilMs, timeAgoFromMs, normalizeDateIL } from './meetings.utils.js'

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
  if (typeof rawStatus === 'object') return toKey(rawStatus.id || '')
  const k = toKey(rawStatus)
  if (statusById[k]) return statusById[k].id
  if (statusByHeb[k]) return statusByHeb[k].id
  return rawStatus
}

function resolveTypeId(rawType) {
  if (!rawType) return ''
  const k = toKey(rawType)
  if (typeById[k]) return typeById[k].id
  if (typeByHeb[k]) return typeByHeb[k].id
  return rawType
}

function labelFromId(kind, idOrAny) {
  const k = toKey(idOrAny)
  if (kind === 'status') return statusById[k]?.labelH || String(idOrAny || '')
  if (kind === 'type') return typeById[k]?.labelH || String(idOrAny || '')
  return String(idOrAny || '')
}

function buildDedupeKey(item) {
  const raw = item?.raw || {}
  const eventId = raw?.eventId || item?.eventId
  if (eventId) return `event:${String(eventId)}`

  // חשוב: לעבוד גם עם meetingDate/meetingHour וגם עם date/time
  const d = String(item?.date || item?.meetingDate || '')
  const t = String(item?.time || item?.meetingHour || '')
  const type = String(item?.typeId || item?.typeLabel || item?.type || '')
  return `dt:${d}|${t}|${type}`
}

function dedupeMeetings(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    if (!item) continue
    const k = buildDedupeKey(item)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

export function normalizeMeetings(rawList) {
  const arr = Array.isArray(rawList) ? rawList : []
  if (!arr.length) return []

  const normalized = arr.map((m, idx) => {
    const rawDate = m?.meetingDate
    const meetingHour = m?.meetingHour
    const statusId = resolveStatusId(m?.status)
    const type = resolveTypeId(m?.type ?? m?.typeId)

    const meetingDate = normalizeDateIL(rawDate)
    const ms = meetingMs(rawDate, meetingHour) ?? meetingMs(rawDate, meetingHour) ?? null
    const isFuture = ms ? ms > Date.now() : false

    const until = isFuture ? getTimeUntilMs(ms) : null
    const ago = !isFuture && ms ? timeAgoFromMs(ms) : null
    const timeLabel = until || ago || null

    return {
      id: String(m?.id ?? idx),
      meetingDate,
      meetingHour,
      notes: String(m?.notes || '').trim(),
      videoId: 'https://drive.google.com/file/d/1o3eroY58OlHI1SZrqV5kIz-yA1A5KQ8D/view?usp=drive_link',
      //videoId: m?.videoId || m?.videoLink || '',
      raw: m,
      type,
      statusId,
      typeLabel: labelFromId('type', type || m?.type),
      statusLabel: labelFromId('status', statusId || m?.status),
      monthKey: getMonthKey(rawDate || meetingDate),
      ms,
      isFuture,
      timeLabel,
    }
  })

  return dedupeMeetings(normalized)
}
