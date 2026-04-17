// playerProfile/sharedLogic/meetings/module/meetings.utils.js

function safeStr(value) {
  return value == null ? '' : String(value)
}

export function toKey(value) {
  return safeStr(value).trim().toLowerCase()
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

export function normalizeDateIL(value) {
  const raw = safeStr(value).trim()
  if (!raw) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-')
    return `${d}/${m}/${y}`
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    return raw
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('-')
    return `${d}/${m}/${y}`
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw

  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

function parseDateParts(dateValue) {
  const raw = safeStr(dateValue).trim()
  if (!raw) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number)
    return { y, m, d }
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('/').map(Number)
    return { y, m, d }
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split('-').map(Number)
    return { y, m, d }
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null

  return {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
  }
}

function parseTimeParts(timeValue) {
  const raw = safeStr(timeValue).trim()
  if (!raw) return { hh: 0, mm: 0 }

  const match = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return { hh: 0, mm: 0 }

  return {
    hh: Number(match[1]) || 0,
    mm: Number(match[2]) || 0,
  }
}

export function meetingMs(dateValue, timeValue) {
  const parts = parseDateParts(dateValue)
  if (!parts) return null

  const time = parseTimeParts(timeValue)
  const date = new Date(parts.y, parts.m - 1, parts.d, time.hh, time.mm, 0, 0)
  const ms = date.getTime()

  return Number.isNaN(ms) ? null : ms
}

export function getMonthKey(dateValue) {
  const parts = parseDateParts(dateValue)
  if (!parts) return ''
  return `${parts.y}-${pad2(parts.m)}`
}

export function getTimeUntilMs(targetMs) {
  if (!Number.isFinite(targetMs)) return null

  const diff = targetMs - Date.now()
  if (diff <= 0) return null

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  const days = Math.floor(diff / day)
  const hours = Math.floor((diff % day) / hour)
  const minutes = Math.floor((diff % hour) / minute)

  if (days > 0) return `בעוד ${days} ימים`
  if (hours > 0) return `בעוד ${hours} שעות`
  if (minutes > 0) return `בעוד ${minutes} דקות`
  return 'בקרוב'
}

export function timeAgoFromMs(targetMs) {
  if (!Number.isFinite(targetMs)) return null

  const diff = Date.now() - targetMs
  if (diff < 0) return null

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  const days = Math.floor(diff / day)
  const hours = Math.floor((diff % day) / hour)
  const minutes = Math.floor((diff % hour) / minute)

  if (days > 0) return `לפני ${days} ימים`
  if (hours > 0) return `לפני ${hours} שעות`
  if (minutes > 0) return `לפני ${minutes} דקות`
  return 'כעת'
}
