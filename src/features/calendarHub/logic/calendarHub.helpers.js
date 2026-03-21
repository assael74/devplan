// src/features/calendar/logic/calendarHub.helpers.js

import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_FILTERS_DEFAULT,
} from './calendarHub.constants.js'

export function startOfWeekSunday(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const diff = x.getDay()
  x.setDate(x.getDate() - diff)
  return x
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function toISODate(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function buildWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function getDefaultCalendarFilters() {
  return { ...CALENDAR_FILTERS_DEFAULT }
}

export function isWeekendEvent(event) {
  const day = new Date(event?.startAt).getDay()
  return day === 5 || day === 6
}

export function isWeekdayEvent(event) {
  return !isWeekendEvent(event)
}

export function filterEventsBySelection(events = [], selection = {}, players = []) {
  const teamId = selection?.teamId || ''
  const playerId = selection?.playerId || ''

  if (playerId) {
    return events.filter((event) => event?.playerId === playerId)
  }

  if (teamId) {
    const playerIds = new Set(
      (players || [])
        .filter((player) => player?.teamId === teamId)
        .map((player) => player?.id)
        .filter(Boolean)
    )

    return events.filter((event) => {
      if (event?.teamId === teamId) return true
      if (event?.playerId && playerIds.has(event.playerId)) return true
      return false
    })
  }

  return events
}

export function filterEventsByType(events = [], filters = {}) {
  const gamesOn = filters?.games !== false
  const trainingsOn = filters?.trainings !== false
  const meetingsOn = filters?.meetings !== false

  return events.filter((event) => {
    if (event?.type === CALENDAR_EVENT_TYPES.game.id) return gamesOn
    if (event?.type === CALENDAR_EVENT_TYPES.training.id) return trainingsOn
    if (event?.type === CALENDAR_EVENT_TYPES.meeting.id) return meetingsOn
    return true
  })
}

export function filterEventsByDayType(events = [], filters = {}) {
  const weekendOn = filters?.weekend !== false
  const weekdayOn = filters?.weekday !== false

  if (weekendOn && weekdayOn) return events
  if (!weekendOn && !weekdayOn) return []

  return events.filter((event) => {
    if (isWeekendEvent(event)) return weekendOn
    return weekdayOn
  })
}

export function filterEventsByWeek(events = [], weekStart) {
  if (!weekStart) return events

  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return events.filter((event) => {
    const eventStart = new Date(event?.startAt)
    return eventStart >= start && eventStart < end
  })
}

export function getBestEventWeekStart(events = []) {
  if (!Array.isArray(events) || !events.length) return null

  const now = new Date()

  const sorted = [...events].sort(
    (a, b) => new Date(a?.startAt) - new Date(b?.startAt)
  )

  const upcoming = sorted.find((event) => new Date(event?.startAt) >= now)
  const chosen = upcoming || sorted[0]

  if (!chosen?.startAt) return null
  return startOfWeekSunday(new Date(chosen.startAt))
}

export function applyCalendarHubFilters({
  events = [],
  selection = {},
  filters = {},
  players = [],
}) {
  let result = [...events]

  result = filterEventsBySelection(result, selection, players)
  result = filterEventsByType(result, filters)
  result = filterEventsByDayType(result, filters)

  result.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))

  return result
}

export function countWeekendEvents(events = []) {
  return events.filter((event) => isWeekendEvent(event)).length
}
