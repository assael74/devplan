// C:\projects\devplan\src\shared\Trainings\trainingsWeek.dates.js

const safeStr = (v) => (v == null ? '' : String(v))
const clean = (v) => safeStr(v).trim()
const to2 = (n) => String(n).padStart(2, '0')

export const dateToYmd = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`
}

export const ymdToDate = (ymd) => {
  const s = clean(ymd)
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export const addDays = (dateObj, n) => {
  const d = new Date(dateObj)
  d.setDate(d.getDate() + (Number(n) || 0))
  return d
}

export const startOfWeekSunday = (dateObj) => {
  const d = new Date(dateObj)
  if (Number.isNaN(d.getTime())) return null
  const day = d.getDay() // 0=sun
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export const normalizeWeekId = (weekIdOrDate) => {
  // Accept: 'YYYY-MM-DD' OR Date. Always returns 'YYYY-MM-DD' of Sunday start.
  if (weekIdOrDate instanceof Date) {
    const w = startOfWeekSunday(weekIdOrDate)
    return w ? dateToYmd(w) : ''
  }
  const d = ymdToDate(weekIdOrDate)
  const w = d ? startOfWeekSunday(d) : null
  return w ? dateToYmd(w) : ''
}

export const buildWeekDatesMap = (weekId) => {
  const wid = normalizeWeekId(weekId)
  const base = ymdToDate(wid)
  if (!base) return null

  return {
    sun: addDays(base, 0),
    mon: addDays(base, 1),
    tue: addDays(base, 2),
    wed: addDays(base, 3),
    thu: addDays(base, 4),
    fri: addDays(base, 5),
    sat: addDays(base, 6),
  }
}
