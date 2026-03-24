// C:\projects\devplan\src\shared\Trainings\trainingsWeek.logic.js

import {
  TRAINING_DAY_KEYS,
  TRAINING_DAY_LABELS,
  TRAINING_TYPES,
  TRAINING_STATUS_META,
  DEFAULT_WEEK_STATUS,
  DEFAULT_WEEK_TITLE,
  EMPTY_TRAINING_DAY
} from './trainingsWeek.model.js'
import { buildWeekDatesMap, dateToYmd, normalizeWeekId } from './trainingsWeek.dates.js'

export const safeStr = (v) => (v == null ? '' : String(v))
export const clean = (v) => safeStr(v).trim()
export const safeNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const buildEmptyDays = (overrides = {}) => {
  const out = {}
  for (const k of TRAINING_DAY_KEYS) {
    out[k] = { ...EMPTY_TRAINING_DAY, ...(overrides[k] || {}) }
  }
  return out
}

export const sanitizeDays = (days) => {
  const input = days && typeof days === 'object' ? days : {}
  const out = {}

  for (const k of TRAINING_DAY_KEYS) {
    const row = input[k] || {}

    out[k] = {
      ...EMPTY_TRAINING_DAY,
      ...row,
      enabled: !!row.enabled,
      hour: clean(row.hour || row.time || ''),
      duration: safeNum(
        row.duration ?? row.durationMinutes,
        EMPTY_TRAINING_DAY.duration
      ),
      type: clean(row.type || EMPTY_TRAINING_DAY.type),
      location: clean(row.location || ''),
      notes: clean(row.notes || ''),
      status: clean(row.status || EMPTY_TRAINING_DAY.status),
    }
  }

  return out
}

export const validateWeekDraft = (draft) => {
  const teamId = clean(draft?.teamId)
  const weekId = normalizeWeekId(draft?.weekId || draft?.weekKey || draft?.weekStartDate)
  const days = sanitizeDays(draft?.days || {})

  const enabledKeys = TRAINING_DAY_KEYS.filter((k) => !!days[k]?.enabled)
  const hasAnyEnabled = enabledKeys.length > 0
  const enabledMissingHour = enabledKeys.filter((k) => !clean(days[k]?.hour))

  return {
    teamId,
    weekId,
    enabledKeys,
    isValid: !!teamId && !!weekId && hasAnyEnabled && enabledMissingHour.length === 0,
    errors: {
      missingTeamId: !teamId,
      missingWeekId: !weekId,
      noEnabledDays: !hasAnyEnabled,
      enabledMissingHour,
    },
  }
}

export const buildWeekFromDraft = ({ draft, now = Date.now() } = {}) => {
  const teamId = clean(draft?.teamId)
  const weekId = normalizeWeekId(draft?.weekId || draft?.weekKey || draft?.weekStartDate)

  if (!teamId) throw new Error('trainingsWeek.logic: missing teamId')
  if (!weekId) throw new Error('trainingsWeek.logic: missing/invalid weekId')

  const title = clean(draft?.title) || DEFAULT_WEEK_TITLE
  const inheritedStatus = clean(draft?.status) || DEFAULT_WEEK_STATUS

  const rawDays = sanitizeDays(draft?.days || buildEmptyDays())
  const days = {}

  for (const k of TRAINING_DAY_KEYS) {
    days[k] = {
      ...rawDays[k],
      status: clean(rawDays[k]?.status) || inheritedStatus,
    }
  }

  return {
    weekId,
    title,
    days,
    createdAt: draft?.createdAt || now,
    updatedAt: now,
  }
}

export const buildDraftFromWeek = ({ teamId, clubId = null, week } = {}) => {
  const w = week || {}

  return {
    teamId: clean(teamId),
    clubId: clubId || null,
    weekId: normalizeWeekId(w.weekId),
    title: clean(w.title) || DEFAULT_WEEK_TITLE,
    status: DEFAULT_WEEK_STATUS,
    days: sanitizeDays(w.days || buildEmptyDays()),
  }
}

export const resolveTrainingTypeMeta = (typeId) => {
  const id = clean(typeId)
  return TRAINING_TYPES.find((x) => x.id === id) || null
}

export const resolveTrainingStatusMeta = (statusId) => {
  const id = clean(statusId) || DEFAULT_WEEK_STATUS
  return TRAINING_STATUS_META[id] || TRAINING_STATUS_META[DEFAULT_WEEK_STATUS]
}

const buildTrainingRowBase = ({ weekId, weekTitle, dayKey, day, date }) => {
  const typeMeta = resolveTrainingTypeMeta(day?.type)
  const statusMeta = resolveTrainingStatusMeta(day?.status)
  const ymd = dateToYmd(date)

  const enabled = !!day?.enabled
  const hasContent =
    !!clean(day?.hour) ||
    !!clean(day?.location) ||
    !!clean(day?.notes) ||
    !!clean(day?.type)

  const isEmpty = !enabled && !hasContent

  return {
    id: `${weekId}-${dayKey}`,
    weekId,
    weekTitle,
    dayKey,
    dayLabel: TRAINING_DAY_LABELS[dayKey] || dayKey,
    date,
    ymd,
    hour: clean(day?.hour),
    duration: safeNum(day?.duration, 90) || 90,
    type: clean(day?.type),
    typeLabel: typeMeta?.labelH || clean(day?.type) || 'אימון',
    typeColor: typeMeta?.color || 'neutral',
    location: clean(day?.location),
    notes: clean(day?.notes),
    status: clean(day?.status) || DEFAULT_WEEK_STATUS,
    statusLabel: statusMeta?.labelH || 'מתוכנן',
    statusColor: statusMeta?.color || 'primary',
    enabled,
    hasContent,
    isEmpty,
    sortKey: `${ymd}-${dayKey}`,
  }
}

export const buildFullWeekRows = ({ week } = {}) => {
  const w = week || {}
  const weekId = normalizeWeekId(w.weekId)
  const weekTitle = clean(w.title) || DEFAULT_WEEK_TITLE
  const days = sanitizeDays(w.days || {})
  const dates = buildWeekDatesMap(weekId)

  if (!weekId || !dates) return []

  return TRAINING_DAY_KEYS.map((dayKey) =>
    buildTrainingRowBase({
      weekId,
      weekTitle,
      dayKey,
      day: days[dayKey],
      date: dates[dayKey],
    })
  )
}

export const flattenTrainingWeek = ({ week, includeDisabled = false } = {}) => {
  const rows = buildFullWeekRows({ week })

  if (includeDisabled) return rows

  return rows.filter((row) => {
    if (row?.enabled) return true
    if (row?.hasContent) return true
    return false
  })
}

export const flattenTrainingWeeks = ({ trainingWeeks = [], includeDisabled = false } = {}) => {
  return (Array.isArray(trainingWeeks) ? trainingWeeks : [])
    .flatMap((week) => flattenTrainingWeek({ week, includeDisabled }))
    .sort((a, b) => {
      const aa = `${a?.ymd || ''}-${a?.hour || ''}`
      const bb = `${b?.ymd || ''}-${b?.hour || ''}`
      return aa.localeCompare(bb)
    })
}

export const groupTrainingRowsByWeek = ({
  trainingWeeks = [],
  includeDisabled = false,
  fillMissingDays = false,
} = {}) => {
  const weeks = Array.isArray(trainingWeeks) ? trainingWeeks : []

  return weeks
    .map((week) => {
      const weekId = normalizeWeekId(week?.weekId)
      const rows = fillMissingDays
        ? buildFullWeekRows({ week })
        : flattenTrainingWeek({ week, includeDisabled })

      return {
        weekId,
        title: clean(week?.title) || DEFAULT_WEEK_TITLE,
        rows,
      }
    })
    .filter((x) => x.weekId)
    .sort((a, b) => a.weekId.localeCompare(b.weekId))
}

export const buildComputedEventsFromWeek = ({ teamId, clubId = null, week } = {}) => {
  const tid = clean(teamId)
  const w = week || {}
  const dates = buildWeekDatesMap(w.weekId)
  if (!tid || !dates) return []

  const days = sanitizeDays(w.days || {})
  const title = clean(w.title) || DEFAULT_WEEK_TITLE
  const weekId = normalizeWeekId(w.weekId)

  const events = []

  for (const k of TRAINING_DAY_KEYS) {
    const row = days[k]
    if (!row.enabled) continue

    const hour = clean(row.hour)
    if (!hour) continue

    const ymd = dateToYmd(dates[k])
    const startAt = new Date(`${ymd}T${hour}:00`)
    if (Number.isNaN(startAt.getTime())) continue

    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + (safeNum(row.duration, 90) || 90))

    events.push({
      teamId: tid,
      clubId: clubId || null,
      weekId,
      dayKey: k,
      title,
      type: row.type,
      location: row.location,
      notes: row.notes,
      status: row.status || DEFAULT_WEEK_STATUS,
      startAt,
      endAt,
      duration: safeNum(row.duration, 90) || 90,
    })
  }

  return events
}
