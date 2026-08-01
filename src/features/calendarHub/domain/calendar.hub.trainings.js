import { normalizeCalendarEvent } from './calendar.hub.base.js'
import { toDateTime, safeArr } from './calendar.hub.utils.js'

const DAY_INDEX_MAP = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

function buildDateFromWeekId(weekId, dayKey) {
  if (!weekId || !dayKey) return null

  const base = new Date(`${weekId}T00:00:00`)
  if (Number.isNaN(base.getTime())) return null

  const targetDay = DAY_INDEX_MAP[dayKey]
  if (targetDay == null) return null

  const currentDay = base.getDay()
  const diff = targetDay - currentDay

  const next = new Date(base)
  next.setDate(base.getDate() + diff)

  return next
}

function resolveTrainingStartAt(training = {}) {
  const rawDate = training?.trainingDate || training?.date || training?.startAt
  const rawHour = training?.hour || training?.trainingHour || ''

  if (rawDate) return toDateTime(rawDate, rawHour)

  const fallbackDate = training?.derivedDate || null
  if (fallbackDate) return toDateTime(fallbackDate, rawHour)

  return null
}

export function normalizeTrainingEvent(trainingRaw, team) {
  const startAt = resolveTrainingStartAt(trainingRaw)
  if (!startAt) return null

  const durationMin = Number(trainingRaw?.duration ?? 90) || 90

  return normalizeCalendarEvent({
    source: 'team',
    type: 'training',
    entityId: team?.id || '',
    itemId: trainingRaw?.id || trainingRaw?.dayKey || '',
    title: trainingRaw?.title || trainingRaw?.name || 'אימון',
    startAt,
    durationMin,
    status: trainingRaw?.status || '',
    teamId: team?.id || '',
    teamName: team?.teamName || '',
    clubId: team?.clubId || '',
    clubName: team?.clubName || '',
    meta: {
      kind: 'training',
      rawId: trainingRaw?.id || '',
      location: trainingRaw?.location || '',
      pitch: trainingRaw?.pitch || '',
      weekId: trainingRaw?.weekId || '',
      dayKey: trainingRaw?.dayKey || '',
      type: trainingRaw?.type || '',
      enabled: trainingRaw?.enabled === true,
    },
  })
}

export function collectTeamTrainings(team) {
  const direct = safeArr(team?.trainings)

  const fromWeeks = safeArr(team?.trainingWeeks).flatMap((week) => {
    const days = week?.days || {}

    return Object.entries(days).flatMap(([dayKey, dayValue]) => {
      if (!dayValue || dayValue?.enabled === false) return []

      const items = Array.isArray(dayValue) ? dayValue : [dayValue]

      return items
        .filter(Boolean)
        .map((training, index) => {
          const derivedDate = buildDateFromWeekId(week?.weekId, dayKey)

          return {
            ...training,
            id: training?.id || `${week?.weekId || ''}_${dayKey}_${index}`,
            title: training?.title || week?.title || 'אימון',
            weekId: week?.weekId || week?.id || '',
            dayKey,
            derivedDate,
          }
        })
    })
  })

  return [...direct, ...fromWeeks]
}
