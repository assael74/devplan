// form.logic.js
import moment from 'moment'
import 'moment/locale/he'

function safeStr(v) {
  return v == null ? '' : String(v)
}

// --- תצוגת תאריך בכותרת בלבד ---
export function formatDateDisplay(d) {
  if (!d) return '—'
  const m = moment(d, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', moment.ISO_8601], true)
  if (!m.isValid()) return safeStr(d)
  return m.locale('he').format('DD.MM.YYYY')
}

export function buildSubtitle(draft) {
  const dd = formatDateDisplay(draft?.meetingDate)
  const tt = safeStr(draft?.meetingHour).trim() || '—'
  return `${dd} · ${tt}`
}

export function statusChipProps(statusId) {
  const id = safeStr(statusId).toLowerCase()
  if (id === 'done') return { color: 'success', label: 'התקיימה' }
  if (id === 'canceled') return { color: 'danger', label: 'בוטלה' }
  return { color: 'primary', label: 'נקבעה' }
}

// --- ולידציה קלה (בינתיים) ---
export function validateDraft(draft) {
  const d = draft || {}
  const errors = {}

  if (!safeStr(d.meetingDate).trim()) errors.meetingDate = 'חובה תאריך'
  if (!safeStr(d.meetingHour).trim()) errors.meetingHour = 'חובה שעה'
  if (!safeStr(d.type).trim()) errors.type = 'חובה סוג'
  if (!safeStr(d.playerId).trim()) errors.playerId = 'חובה שחקן'

  return { ok: Object.keys(errors).length === 0, errors }
}
