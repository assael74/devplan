// ui/patterns/schedule/logic/schedule.logic.js

import {
  flattenTrainingWeeks,
  groupTrainingRowsByWeek,
  normalizeWeekId,
} from '../../../../shared/trainings'
import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'

const WEEK_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const WEEK_DAY_LABELS = {
  sun: "א׳",
  mon: "ב׳",
  tue: "ג׳",
  wed: "ד׳",
  thu: "ה׳",
  fri: "ו׳",
  sat: "ש׳",
}

const safeStr = (v) => (v == null ? '' : String(v))
const clean = (v) => safeStr(v).trim()

const addDaysToWeekId = (weekId, daysToAdd) => {
  const wid = normalizeWeekId(weekId)
  if (!wid) return ''

  const d = new Date(`${wid}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''

  d.setDate(d.getDate() + (Number(daysToAdd) || 0))
  return d.toISOString().slice(0, 10)
}

const buildEmptyDayRow = ({ weekId = '', dayKey = '' } = {}) => ({
  id: `empty-${weekId || 'week'}-${dayKey}`,
  weekId,
  dayKey,
  dayLabel: WEEK_DAY_LABELS[dayKey] || dayKey,
  isEmpty: true,
  status: 'empty',
  statusLabel: 'ללא אימון',
  statusColor: 'neutral',
  hour: '',
  duration: null,
  typeLabel: '',
  location: '',
  date: null,
})

export const fillMissingWeekDays = ({ weekId = '', rows = [] } = {}) => {
  const rowsArr = Array.isArray(rows) ? rows : []
  const byDayKey = new Map()

  rowsArr.forEach((row) => {
    const key = clean(row?.dayKey)
    if (key) byDayKey.set(key, row)
  })

  return WEEK_DAY_KEYS.map((dayKey) => byDayKey.get(dayKey) || buildEmptyDayRow({ weekId, dayKey }))
}

export const resolveTrainingWeeksInput = ({ entity, trainingWeeks } = {}) => {
  if (Array.isArray(trainingWeeks)) return trainingWeeks
  if (Array.isArray(entity?.trainingWeeks)) return entity.trainingWeeks
  if (Array.isArray(entity?.training)) return entity.training
  if (Array.isArray(entity?.weeksList)) return entity.weeksList
  return []
}

export const buildScheduleModel = ({
  entity = null,
  trainingWeeks = null,
  selectedWeekId = '',
} = {}) => {
  const weeks = resolveTrainingWeeksInput({ entity, trainingWeeks })
  const weekGroups = groupTrainingRowsByWeek({ trainingWeeks: weeks })
  const allRows = flattenTrainingWeeks({ trainingWeeks: weeks })

  const normalizedSelected = normalizeWeekId(selectedWeekId)
  const firstWeekId = weekGroups[0]?.weekId || ''
  const currentWeekId = normalizedSelected || firstWeekId
  const nextWeekId = addDaysToWeekId(currentWeekId, 7)

  const rawCurrentWeek = weekGroups.find((x) => x.weekId === currentWeekId) || {
    weekId: currentWeekId,
    title: 'השבוע',
    rows: [],
  }

  const rawNextWeek = weekGroups.find((x) => x.weekId === nextWeekId) || {
    weekId: nextWeekId,
    title: 'שבוע הבא',
    rows: [],
  }

  const currentWeek = {
    ...rawCurrentWeek,
    rows: fillMissingWeekDays({
      weekId: rawCurrentWeek.weekId,
      rows: rawCurrentWeek.rows,
    }),
  }

  const nextWeek = {
    ...rawNextWeek,
    rows: fillMissingWeekDays({
      weekId: rawNextWeek.weekId,
      rows: rawNextWeek.rows,
    }),
  }

  const nearestRow = allRows[0] || null

  return {
    weeks,
    allRows,
    weekGroups,
    currentWeekId,
    nextWeekId,
    currentWeek,
    nextWeek,
    nearestRow,
    summary: {
      totalWeeks: weekGroups.length,
      totalTrainings: allRows.length,
      currentWeekCount: (rawCurrentWeek.rows || []).length,
      nextWeekCount: (rawNextWeek.rows || []).length,
    },
  }
}

export const buildScheduleHeaderStats = (model) => {
  const summary = model?.summary || {}

  return [
    { id: 'all', label: 'סה״כ', value: summary.totalTrainings || 0, color: 'neutral' },
    { id: 'current', label: 'השבוע', value: summary.currentWeekCount || 0, color: 'primary' },
    { id: 'next', label: 'שבוע הבא', value: summary.nextWeekCount || 0, color: 'success' },
  ]
}

export const formatDurationLabel = (duration) => {
  const n = Number(duration)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${n} דק׳`
}

export const getCompactTrainingLabel = (row) => {
  if (!row) return '—'
  if (row?.isEmpty) return 'אין אימון'

  const parts = [
    clean(row?.hour),
    formatDurationLabel(row?.duration),
  ].filter(Boolean)

  return parts.join(' · ') || 'אימון'
}

export const getCompactTrainingSubLabel = (row) => {
  if (!row || row?.isEmpty) return ''

  const dateLabel =
    row?.date instanceof Date
      ? getFullDateIl(row.date)
      : ''

  const parts = [
    clean(row?.typeLabel),
    clean(row?.location),
    dateLabel,
  ].filter(Boolean)

  return parts.join(' · ')
}
