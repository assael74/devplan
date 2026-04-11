//   C:\projects\devplan\src\shared\abilities\engine\abilitiesHistory.utils.js

// קובץ מקביל: functions/src/domain/abilities/engine/abilitiesHistory.utils.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד Functions.

export function safeStr(v) {
  return String(v ?? '').trim()
}

export function toNum(v, fallback = null) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num))
}

export function round1(num) {
  if (!Number.isFinite(Number(num))) return null
  return Math.round(Number(num) * 10) / 10
}

export function round2(num) {
  if (!Number.isFinite(Number(num))) return null
  return Math.round(Number(num) * 100) / 100
}

export function roundToHalf(num) {
  if (!Number.isFinite(Number(num))) return null
  return Math.round(Number(num) * 2) / 2
}

export function isFilled(v) {
  return v != null && v !== '' && Number.isFinite(Number(v)) && Number(v) > 0
}

export function toIsoDateOnly(input) {
  const raw = safeStr(input)
  if (!raw) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null

  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function parseIsoDateOnly(isoDate) {
  const raw = safeStr(isoDate)
  if (!raw) return null
  const d = new Date(`${raw}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
