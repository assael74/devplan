// C:\projects\devplan\src\ui\patterns\schedule\components\editDrawer\logic\editDayTrainingDrawer.logic.js

const EMPTY_DRAFT = {}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const safeStr = (v) => (v == null ? '' : String(v))
const clean = (v) => safeStr(v).trim()

const toNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function normalizeWeekId(value) {
  return clean(value)
}

function buildDateLabel(value) {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  })
}

function normalizeTrainingWeeks(team = null) {
  if (Array.isArray(team?.trainingWeeks)) return team.trainingWeeks
  if (Array.isArray(team?.teamsTraining?.trainingWeeks)) return team.teamsTraining.trainingWeeks
  if (Array.isArray(team?.teamsTraining)) return team.teamsTraining
  return []
}

function normalizeDay(day = {}) {
  return {
    hour: clean(day?.hour || day?.time || ''),
    duration: toNum(day?.duration ?? day?.durationMinutes, 0),
    type: clean(day?.type || ''),
    location: clean(day?.location || ''),
    enabled: !!day?.enabled,
    status: clean(day?.status || ''),
  }
}

function normalizeWeekItem(item = {}) {
  return {
    title: clean(item?.title || 'אימון'),
    weekId: normalizeWeekId(item?.weekId),
    createdAt: item?.createdAt || '',
    updatedAt: item?.updatedAt || '',
    days: item?.days && typeof item?.days === 'object' ? item.days : {},
  }
}

function resolveExistingDay(week = null) {
  return normalizeDay(week)
}

export function buildInitialDraft(team = null, week = null) {
  const teamId = clean(team?.id || team?.teamId || '')
  const current = resolveExistingDay(week)

  return {
    teamId,
    weekId: normalizeWeekId(week?.weekId),
    dayKey: clean(week?.dayKey),
    dayLabel: clean(week?.dayLabel),
    date: clean(week?.ymd || week?.date || ''),
    dateLabel: buildDateLabel(week?.ymd || week?.date || ''),
    hour: current.hour,
    duration: current.duration,
    type: current.type,
    location: current.location,
    enabled: current.enabled || Boolean(current.hour || current.duration || current.type || current.location),
    status: current.status || 'planned',
    raw: week || EMPTY_DRAFT,
  }
}

export function getIsValid(draft = EMPTY_DRAFT) {
  return Boolean(
    clean(draft?.teamId) &&
    clean(draft?.weekId) &&
    clean(draft?.dayKey) &&
    clean(draft?.hour) &&
    clean(draft?.type)
  )
}

function buildComparable(draft = EMPTY_DRAFT) {
  return {
    teamId: clean(draft?.teamId),
    weekId: clean(draft?.weekId),
    dayKey: clean(draft?.dayKey),
    hour: clean(draft?.hour),
    duration: toNum(draft?.duration, 0),
    type: clean(draft?.type),
    location: clean(draft?.location),
    enabled: !!draft?.enabled,
    status: clean(draft?.status || 'planned'),
  }
}

export function getIsDirty(draft = EMPTY_DRAFT, initial = EMPTY_DRAFT) {
  return JSON.stringify(buildComparable(draft)) !== JSON.stringify(buildComparable(initial))
}

function buildDayPatch(draft = EMPTY_DRAFT) {
  return {
    hour: clean(draft?.hour),
    duration: toNum(draft?.duration, 0),
    type: clean(draft?.type),
    location: clean(draft?.location),
    enabled: true,
    status: clean(draft?.status || 'planned'),
  }
}

export function buildPatch(draft = EMPTY_DRAFT, initial = EMPTY_DRAFT, team = null) {
  const currentWeeks = normalizeTrainingWeeks(team).map(normalizeWeekItem)

  const weekId = clean(draft?.weekId || initial?.weekId)
  const dayKey = clean(draft?.dayKey || initial?.dayKey)
  const now = new Date().toISOString()

  if (!weekId || !dayKey) {
    return { trainingWeeks: currentWeeks }
  }

  const existingIndex = currentWeeks.findIndex((item) => clean(item?.weekId) === weekId)
  const nextDay = buildDayPatch(draft)

  if (existingIndex === -1) {
    return {
      trainingWeeks: [
        ...currentWeeks,
        {
          title: 'אימון',
          weekId,
          createdAt: now,
          updatedAt: now,
          days: {
            [dayKey]: nextDay,
          },
        },
      ].sort((a, b) => clean(a?.weekId).localeCompare(clean(b?.weekId))),
    }
  }

  const trainingWeeks = currentWeeks.map((item, index) => {
    if (index !== existingIndex) return item

    return {
      ...item,
      updatedAt: now,
      days: {
        ...(item?.days || {}),
        [dayKey]: nextDay,
      },
    }
  })

  return {
    trainingWeeks: trainingWeeks.sort((a, b) => clean(a?.weekId).localeCompare(clean(b?.weekId))),
  }
}
