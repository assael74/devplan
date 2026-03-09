// C:\projects\devplan\src\ui\forms\helpers\trainings\trainingsWeekForm.helpers.js
export const safeStr = (v) => (v == null ? '' : String(v))
export const clean = (v) => safeStr(v).trim()
export const to2 = (n) => String(n).padStart(2, '0')

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
export const DAY_LABELS = { sun: "א׳", mon: "ב׳", tue: "ג׳", wed: "ד׳", thu: "ה׳", fri: "ו׳", sat: "ש׳" }

export const todayDateStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`
}

export const startOfWeekSunday = (d = new Date()) => {
  const x = new Date(d)
  const day = x.getDay() // 0=sun
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

export const dateStrFromDate = (d) => `${d.getFullYear()}-${to2(d.getMonth() + 1)}-${to2(d.getDate())}`

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const buildEmptyDays = () =>
  DAY_KEYS.reduce((acc, k) => {
    acc[k] = {
      enabled: false,
      hour: '00:00',
      duration: 90,
      type: 'technical',
      location: '',
      notes: '',
    }
    return acc
  }, {})

export const buildWeekDates = (weekStartObj) =>
  DAY_KEYS.reduce((acc, k, idx) => {
    acc[k] = addDays(weekStartObj, idx)
    return acc
  }, {})

export const calcValidity = ({ teamId, weekStartDate, days }) => {
  const okTeam = !!clean(teamId)
  const okWeek = !!clean(weekStartDate)

  const enabledKeys = DAY_KEYS.filter((k) => !!days?.[k]?.enabled)
  const okAnyDay = enabledKeys.length > 0

  const enabledMissingHour = enabledKeys.filter((k) => !clean(days?.[k]?.hour))

  return {
    isValid: okTeam && okWeek && okAnyDay && enabledMissingHour.length === 0,
    enabledKeys,
    enabledMissingHour,
  }
}

export const applyDefaultsToEnabledDays = ({ days, defaults }) => {
  const src = days && typeof days === 'object' ? days : {}
  const d = defaults && typeof defaults === 'object'
    ? defaults
    : { hour: '00:00', duration: 90, type: 'technical', location: '' }

  const next = { ...src }

  for (const k of DAY_KEYS) {
    const row = src[k] || {}
    if (!row.enabled) continue

    next[k] = {
      ...row,
      hour: d.hour || '00:00',
      duration: d.duration ?? 90,
      type: d.type || 'technical',
      location: d.location || '',
    }
  }

  return next
}

export const toggleAllDays = ({ days, on }) => {
  const nextDays = { ...(days || {}) }
  for (const k of DAY_KEYS) nextDays[k] = { ...(nextDays[k] || {}), enabled: !!on }
  return nextDays
}

export const updateDayInDays = ({ days, dayKey, partial }) => {
  return { ...(days || {}), [dayKey]: { ...((days || {})[dayKey] || {}), ...(partial || {}) } }
}

export const calcPreviewCount = (days) =>
  DAY_KEYS.filter((k) => {
    const row = days[k] || {}
    return row.enabled && clean(row.hour)
  }).length
