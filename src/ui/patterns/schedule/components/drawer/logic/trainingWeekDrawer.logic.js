// ui/patterns/schedule/components/drawer/logic/trainingWeekDrawer.logic.js

const EMPTY_DRAFT = {}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const safeStr = (v) => (v == null ? '' : String(v))
const clean = (v) => safeStr(v).trim()
const toNum = (v) => Number(v || 0) || 0

function resolveTeamId(team = null, seed = null) {
  return clean(seed?.teamId || team?.id || team?.teamId)
}

function resolveWeekId(seed = null) {
  return clean(seed?.weekId || seed?.weekKey || seed?.weekStartDate || '')
}

function toBool(value) {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function dateToYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getCurrentWeekStartSundayStr() {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setHours(0, 0, 0, 0)
  sunday.setDate(now.getDate() - now.getDay())
  return dateToYmd(sunday)
}

function normalizeDraftDay(day = {}, fallbackDayKey = '') {
  return {
    dayKey: clean(day?.dayKey || fallbackDayKey),
    date: clean(day?.date),
    hour: clean(day?.hour),
    duration: toNum(day?.duration),
    type: clean(day?.type),
    location: clean(day?.location),
    status: clean(day?.status || 'planned'),
    enabled: toBool(day?.enabled),
    active: toBool(day?.active) || toBool(day?.enabled),
  }
}

function normalizeDays(days) {
  if (Array.isArray(days)) {
    return days.map((day) => normalizeDraftDay(day))
  }

  if (days && typeof days === 'object') {
    return Object.entries(days).map(([dayKey, day]) =>
      normalizeDraftDay(day, dayKey)
    )
  }

  return []
}

function isRelevantDay(day = {}) {
  const safe = normalizeDraftDay(day)

  if (!DAY_KEYS.includes(safe.dayKey)) return false
  if (!safe.active) return false

  return Boolean(
    safe.hour ||
    safe.duration > 0 ||
    safe.type ||
    safe.location
  )
}

function buildFirestoreDay(day = {}) {
  const safe = normalizeDraftDay(day)

  return {
    duration: safe.duration || 0,
    enabled: true,
    hour: safe.hour || '',
    location: safe.location || '',
    status: safe.status || 'planned',
    type: safe.type || '',
  }
}

function buildComparableDays(days) {
  return normalizeDays(days)
    .filter(isRelevantDay)
    .sort((a, b) => DAY_KEYS.indexOf(a.dayKey) - DAY_KEYS.indexOf(b.dayKey))
    .map((day) => ({
      dayKey: day.dayKey,
      hour: day.hour,
      duration: day.duration,
      type: day.type,
      location: day.location,
      status: day.status || 'planned',
      enabled: true,
    }))
}

function normalizeExistingWeek(item = {}) {
  return {
    title: clean(item?.title || 'אימון'),
    weekId: clean(item?.weekId),
    createdAt: item?.createdAt || '',
    updatedAt: item?.updatedAt || '',
    days: item?.days && typeof item?.days === 'object' ? item.days : {},
  }
}

function buildWeekItem(draft = EMPTY_DRAFT, initial = EMPTY_DRAFT) {
  const weekStartDate = clean(draft?.weekStartDate || resolveWeekId(draft))
  const normalizedDays = normalizeDays(draft?.days)

  const days = normalizedDays
    .filter(isRelevantDay)
    .reduce((acc, day) => {
      acc[day.dayKey] = buildFirestoreDay(day)
      return acc
    }, {})

  const now = new Date().toISOString()

  return {
    title: 'אימון',
    weekId: weekStartDate,
    createdAt: initial?.createdAt || draft?.createdAt || now,
    updatedAt: now,
    days,
  }
}

function resolveTrainingWeeks(team = null) {
  if (Array.isArray(team?.trainingWeeks)) return team.trainingWeeks
  if (Array.isArray(team?.teamsTraining?.trainingWeeks)) return team.teamsTraining.trainingWeeks
  if (Array.isArray(team?.teamsTraining)) return team.teamsTraining
  return []
}

export function buildInitialDraft(team = null, seed = EMPTY_DRAFT) {
  const teamId = resolveTeamId(team, seed)
  const weekStartDate = resolveWeekId(seed) || getCurrentWeekStartSundayStr()

  return {
    id: teamId,
    teamId,
    weekId: weekStartDate,
    weekStartDate,
    title: clean(seed?.title || 'אימון'),
    createdAt: seed?.createdAt || '',
    updatedAt: seed?.updatedAt || '',
    defaults: {
      hour: clean(seed?.defaults?.hour || '18:00'),
      duration: toNum(seed?.defaults?.duration || 90),
      type: clean(seed?.defaults?.type || 'technical'),
      location: clean(seed?.defaults?.location || ''),
    },
    days: normalizeDays(seed?.days),
    raw: seed || EMPTY_DRAFT,
  }
}

export function buildPatch(draft = EMPTY_DRAFT, initial = EMPTY_DRAFT, team = null) {
  const nextWeek = buildWeekItem(draft, initial)
  const currentWeeks = resolveTrainingWeeks(team).map(normalizeExistingWeek)

  const existingIndex = currentWeeks.findIndex(
    (item) => clean(item?.weekId) === clean(nextWeek?.weekId)
  )

  let trainingWeeks = []

  if (existingIndex === -1) {
    trainingWeeks = [...currentWeeks, nextWeek]
  } else {
    trainingWeeks = currentWeeks.map((item, index) => {
      if (index !== existingIndex) return item

      return {
        ...item,
        ...nextWeek,
        createdAt: item?.createdAt || nextWeek.createdAt,
      }
    })
  }

  trainingWeeks.sort((a, b) => clean(a?.weekId).localeCompare(clean(b?.weekId)))

  return {
    trainingWeeks,
  }
}

export function getIsDirty(draft = EMPTY_DRAFT, initial = EMPTY_DRAFT) {
  const currentComparable = {
    weekId: clean(draft?.weekStartDate || resolveWeekId(draft)),
    days: buildComparableDays(draft?.days),
  }

  const initialComparable = {
    weekId: clean(initial?.weekStartDate || resolveWeekId(initial)),
    days: buildComparableDays(initial?.days),
  }

  return JSON.stringify(currentComparable) !== JSON.stringify(initialComparable)
}
