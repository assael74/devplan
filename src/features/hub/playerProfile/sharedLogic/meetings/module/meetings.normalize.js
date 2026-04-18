// playerProfile/sharedLogic/meetings/module/meetings.normalize.js

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

function buildMetaMaps() {
  const statusById = {}
  const statusByHeb = {}

  for (const item of MEETING_STATUSES || []) {
    statusById[toKey(item.id)] = item
    statusByHeb[toKey(item.labelH)] = item
  }

  const typeById = {}
  const typeByHeb = {}

  for (const item of MEETING_TYPES || []) {
    typeById[toKey(item.id)] = item
    typeByHeb[toKey(item.labelH)] = item
  }

  return {
    statusById,
    statusByHeb,
    typeById,
    typeByHeb,
  }
}

const {
  statusById,
  statusByHeb,
  typeById,
  typeByHeb,
} = buildMetaMaps()

function createEmptyMeta(id = '') {
  return {
    id: id || '',
    label: '',
    labelH: '',
    idIcon: '',
    disabled: false,
  }
}

function resolveMeetingStatusMeta(rawStatus) {
  if (!rawStatus) return createEmptyMeta()

  if (typeof rawStatus === 'object') {
    const currentId = rawStatus?.current?.id || rawStatus?.id || ''
    const key = toKey(currentId)

    if (statusById[key]) return statusById[key]
    if (statusByHeb[key]) return statusByHeb[key]

    return createEmptyMeta(currentId)
  }

  const key = toKey(rawStatus)

  if (statusById[key]) return statusById[key]
  if (statusByHeb[key]) return statusByHeb[key]

  return createEmptyMeta(rawStatus)
}

function resolveMeetingTypeMeta(rawType) {
  if (!rawType) return createEmptyMeta()

  const key = toKey(rawType)

  if (typeById[key]) return typeById[key]
  if (typeByHeb[key]) return typeByHeb[key]

  return createEmptyMeta(rawType)
}

function resolveMeetingState(statusId, ms) {
  const normalizedStatusId = String(statusId || '')
  const isPastByDate = Number.isFinite(ms) ? ms < Date.now() : false

  if (normalizedStatusId === 'done') return 'done'
  if (normalizedStatusId === 'canceled') return 'canceled'
  if (normalizedStatusId === 'new' && isPastByDate) return 'overdue'
  return 'upcoming'
}

function getMeetingTone(meetingState) {
  if (meetingState === 'done') {
    return {
      tone: 'success',
      statusBg: 'success.softBg',
      statusColor: 'success.softColor',
      glow: '0 10px 28px rgba(46, 125, 50, 0.16)',
      icon: 'meetingDone',
    }
  }

  if (meetingState === 'canceled') {
    return {
      tone: 'danger',
      statusBg: 'danger.softBg',
      statusColor: 'danger.softColor',
      glow: '0 10px 28px rgba(211, 47, 47, 0.16)',
      icon: 'meetingCancel',
    }
  }

  if (meetingState === 'overdue') {
    return {
      tone: 'warning',
      statusBg: 'warning.softBg',
      statusColor: 'warning.softColor',
      glow: '0 10px 28px rgba(245, 158, 11, 0.18)',
      icon: 'meetings',
    }
  }

  return {
    tone: 'primary',
    statusBg: 'primary.softBg',
    statusColor: 'primary.softColor',
    glow: '0 10px 28px rgba(25, 118, 210, 0.16)',
    icon: 'meetings',
  }
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
  const output = []

  for (const item of items) {
    if (!item) continue

    const key = buildDedupeKey(item)
    if (seen.has(key)) continue

    seen.add(key)
    output.push(item)
  }

  return output
}

export function normalizeMeetings(rawList) {
  const items = Array.isArray(rawList) ? rawList : []
  if (!items.length) return []

  const normalized = items.map((meeting, index) => {
    const rawDate = meeting?.meetingDate || meeting?.date || ''
    const rawHour = meeting?.meetingHour || meeting?.time || ''

    const statusMeta = resolveMeetingStatusMeta(meeting?.status || meeting?.statusId)
    const typeMeta = resolveMeetingTypeMeta(meeting?.type ?? meeting?.typeId)

    const meetingDate = normalizeDateIL(rawDate)
    const ms = meetingMs(rawDate, rawHour)
    const isFuture = Number.isFinite(ms) ? ms > Date.now() : false

    const until = isFuture ? getTimeUntilMs(ms) : null
    const ago = !isFuture && Number.isFinite(ms) ? timeAgoFromMs(ms) : null

    const meetingState = resolveMeetingState(statusMeta.id, ms)
    const toneMeta = getMeetingTone(meetingState)

    return {
      id: String(meeting?.id ?? index),
      raw: meeting,

      meetingDate,
      meetingHour: rawHour,
      notes: String(meeting?.notes || '').trim(),

      type: typeMeta.id,
      typeId: typeMeta.id,
      typeLabel: typeMeta.labelH || typeMeta.label || '',
      typeIcon: typeMeta.idIcon || '',
      typeMeta,

      status: statusMeta.id,
      statusId: statusMeta.id,
      statusLabel: statusMeta.labelH || statusMeta.label || '',
      statusIcon: statusMeta.idIcon || '',
      statusMeta,

      meetingState,
      tone: toneMeta.tone,
      statusBg: toneMeta.statusBg,
      statusColor: toneMeta.statusColor,
      glow: toneMeta.glow,
      toneIcon: toneMeta.icon,

      videoId: meeting?.videoId || '',
      videoLink: meeting?.videoLink || '',

      monthKey: getMonthKey(rawDate || meetingDate),
      ms,
      isFuture,
      timeLabel: until || ago || null,
    }
  })

  return dedupeMeetings(normalized)
}
