// playerProfile/sharedLogic/meetings/drawer/meetingDraft.mapper.js

import moment from 'moment'
import 'moment/locale/he'

function safeStr(v) {
  return v == null ? '' : String(v)
}

function pickFirst(...vals) {
  for (const v of vals) {
    const s = safeStr(v).trim()
    if (s) return s
  }
  return ''
}

function resolveStatusObj(raw) {
  if (!raw) return { id: 'new', time: moment().format('DD/MM/YYYY') }
  if (typeof raw === 'object') {
    const id = safeStr(raw?.id || '').trim() || 'new'
    const time = safeStr(raw?.time || '').trim() || moment().format('DD/MM/YYYY')
    return { id, time }
  }
  return { id: safeStr(raw).trim() || 'new', time: moment().format('DD/MM/YYYY') }
}

// --- rawMeeting (Firestore / model) -> draft (form state) ---
export function meetingToDraft(meeting) {
  const m = meeting || {}
  const raw = (m?.raw && typeof m.raw === 'object') ? m.raw : m

  const meetingDate = pickFirst(raw?.meetingDate, raw?.date, m?.meetingDate, m?.date)
  const meetingHour = pickFirst(raw?.meetingHour, raw?.time, m?.meetingHour, m?.time)

  const type = pickFirst(raw?.type, m?.type, m?.typeId, 'personal')
  const status = resolveStatusObj(pickFirst(raw?.status, m?.statusId, m?.statusLabel, m?.status))

  return {
    id: raw?.id || m?.id || null,
    meetingDate: meetingDate || '',
    meetingHour: meetingHour || '',
    type: type || 'personal',
    status,
    // --- תמיד notes ---
    notes: safeStr(raw?.notes || m?.notes || '').trim(),
    videoLink: pickFirst(raw?.videoLink, raw?.videoId, m?.videoLink, m?.videoId),
    playerId: pickFirst(raw?.playerId, m?.playerId),
  }
}

// --- draft -> payload לכתיבה (MVP / Firestore) ---
export function draftToPayload(draft) {
  const d = draft || {}
  return {
    id: d?.id || null,
    meetingDate: safeStr(d?.meetingDate).trim(),
    meetingHour: safeStr(d?.meetingHour).trim(),
    type: safeStr(d?.type).trim() || 'personal',
    status: d?.status && typeof d.status === 'object'
      ? { id: safeStr(d.status.id || 'new'), time: safeStr(d.status.time || moment().format('DD/MM/YYYY')) }
      : { id: 'new', time: moment().format('DD/MM/YYYY') },
    notes: safeStr(d?.notes).trim(),
    videoLink: safeStr(d?.videoLink).trim(),
    playerId: safeStr(d?.playerId).trim(),
  }
}
