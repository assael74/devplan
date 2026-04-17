// playerProfile/sharedLogic/meetings/module/meetingEdit.logic.js

import { normalizeMeetingStatus } from '../../../../../../shared/meetings/meetings.status.js'
import { buildMeetingPatch } from '../../../../../../shared/meetings/meetings.patch.js'

function toSafeString(value) {
  return value == null ? '' : String(value)
}

function toInputDate(value) {
  const raw = toSafeString(value).trim()
  if (!raw) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('/')
    return `${year}-${month}-${day}`
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('-')
    return `${year}-${month}-${day}`
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeTags(tags) {
  return Array.isArray(tags) ? tags.filter(Boolean).map((tag) => String(tag)) : []
}

export function buildInitialDraft(selected) {
  if (!selected) return null

  return {
    id: selected.id || '',
    title: toSafeString(selected.title),
    meetingDate: toInputDate(selected.meetingDate || selected.date || ''),
    meetingHour: toSafeString(selected.meetingHour || selected.time || ''),
    type: toSafeString(selected.type),
    status: normalizeMeetingStatus(selected.status || selected.raw?.status || selected.statusId || ''),
    notes: toSafeString(selected.notes),
    tags: normalizeTags(selected.tags),
    videoId: toSafeString(selected.videoId),
    videoLink: toSafeString(selected.videoLink),
  }
}

export function buildPatch(selected, draft) {
  if (!selected || !draft) return {}

  return buildMeetingPatch({
    draft,
    original: selected,
  })
}

function normalizeDraftForCompare(draft) {
  if (!draft) return null

  return {
    id: draft.id || '',
    title: draft.title || '',
    meetingDate: draft.meetingDate || '',
    meetingHour: draft.meetingHour || '',
    type: draft.type || '',
    statusId: draft?.status?.current?.id || '',
    notes: draft.notes || '',
    tags: Array.isArray(draft.tags) ? draft.tags.map(String) : [],
    videoId: draft.videoId || '',
    videoLink: draft.videoLink || '',
  }
}

export function getIsDirty(draft, initial) {
  const a = normalizeDraftForCompare(draft)
  const b = normalizeDraftForCompare(initial)

  return JSON.stringify(a) !== JSON.stringify(b)
}
