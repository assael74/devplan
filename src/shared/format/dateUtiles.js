// C:\projects\devplan\src\shared\format\dateUtiles.js
import moment from 'moment'
import 'moment/locale/he'

moment.locale('he')

const to2 = (n) => String(n).padStart(2, '0')
const clean = (v) => String(v ?? '').trim()

// ---- existing exports remain as-is ----
export function getFullDateIl(dateObject, isMobile) {
  if (!dateObject) return '—'
  const date = new Date(dateObject)
  if (isNaN(date.getTime())) return '—'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const yy = String(year % 100).padStart(2, '0')

  return `${day}-${month}-${isMobile ? yy : year}`
}

export function getDayName(dateStr, isMobile) {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const daysLetter = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]
  const date = new Date(dateStr)
  const dayIndex = date.getDay()
  return isMobile ? daysLetter[dayIndex] : days[dayIndex]
}

export function timeAgoIl({ date, hour }) {
  if (!date) return null

  const h = hour || '00:00'
  const dt = moment(`${date}T${h}`)
  if (!dt.isValid()) return null

  const now = moment()
  if (dt.isAfter(now)) return null

  const diffMinutes = now.diff(dt, 'minutes')
  const diffHours = now.diff(dt, 'hours')
  const diffDays = now.diff(dt, 'days')
  const diffMonths = now.diff(dt, 'months')
  const diffYears = now.diff(dt, 'years')

  if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`
  if (diffDays < 30) {
    if (diffHours < 24) return `לפני ${diffHours} שעות`
    return `לפני ${diffDays} ימים`
  }
  if (diffMonths < 12) return `לפני ${diffMonths} חודשים`
  return `לפני ${diffYears} שנים`
}

export function getTimeUntilMeeting(meeting) {
  const now = moment()
  const fullDateTime = `${meeting.meetingDate}T${meeting.meetingHour}`
  const meetingDate = moment(fullDateTime)

  if (meetingDate.isBefore(now)) return null

  const duration = moment.duration(meetingDate.diff(now))
  const days = Math.floor(duration.asDays())
  const hours = duration.hours()
  const minutes = duration.minutes()

  if (days > 0)
    return `בעוד ${days} יום${days === 1 ? '' : 'ים'}${hours > 0 ? ` ו-${hours} שעות` : ''}${minutes > 0 ? ` ו-${minutes} דקות` : ''}`
  if (hours > 0) return `בעוד ${hours} שעות${minutes > 0 ? ` ו-${minutes} דקות` : ''}`
  if (minutes > 0) return `בעוד ${minutes} דקות`
  return 'עוד רגע'
}

// ---- NEW: form-level converters (reusable across all forms) ----

// ISO "YYYY-MM-DD" -> "DD-MM-YYYY"
export function ymdToDmy(ymd) {
  const s = clean(ymd)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ''
  return `${m[3]}-${m[2]}-${m[1]}`
}

// "DD-MM-YYYY" -> ISO "YYYY-MM-DD"
export function dmyToYmd(dmy) {
  const s = clean(dmy)
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!m) return ''
  const ymd = `${m[3]}-${m[2]}-${m[1]}`
  const d = new Date(`${ymd}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '' : ymd
}

// Normalize date input: accepts "YYYY-MM-DD" or "DD-MM-YYYY"
export function normalizeFullDate(value) {
  const s = clean(value)
  if (!s) return { ymd: '', dmy: '' }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`)
    if (Number.isNaN(d.getTime())) return { ymd: '', dmy: '' }
    return { ymd: s, dmy: ymdToDmy(s) }
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const ymd = dmyToYmd(s)
    return ymd ? { ymd, dmy: s } : { ymd: '', dmy: '' }
  }

  return { ymd: '', dmy: '' }
}

export function normalizeTimeHm(value) {
  const s = clean(value)
  if (!s) return ''
  const m = s.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  return m ? s : ''
}

// month-only: returns "MM"
export function normalizeMonth(value) {
  const s = clean(value)
  const n = Number(s)
  if (!n || n < 1 || n > 12) return ''
  return to2(n)
}

// month-year: returns "MM-YYYY"
export function normalizeMonthYearMmYyyy(value) {
  const s = clean(value)
  const m = s.match(/^(\d{2})-(\d{4})$/)
  if (!m) return ''
  const mm = Number(m[1])
  const yyyy = Number(m[2])
  if (!mm || mm < 1 || mm > 12) return ''
  if (!yyyy || yyyy < 1900 || yyyy > 2100) return ''
  return `${to2(mm)}-${yyyy}`
}
