// src/features/calendar/logic/calendarHub.helpers.js

import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_FILTERS_DEFAULT,
  CALENDAR_FILTER_GROUPS,
  CALENDAR_SORT_DEFAULT,
  CALENDAR_SORT_OPTIONS
} from './calendarHub.constants.js'

export function normalizeLocalDay(value) {
  const d = value instanceof Date ? new Date(value) : new Date(value)

  if (Number.isNaN(d.getTime())) {
    const fallback = new Date()
    fallback.setHours(0, 0, 0, 0)
    return fallback
  }

  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameLocalDay(a, b) {
  const x = normalizeLocalDay(a)
  const y = normalizeLocalDay(b)

  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

export function startOfWeekSunday(d) {
  const x = normalizeLocalDay(d)
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
  const x = normalizeLocalDay(d)
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

export function getDefaultCalendarSort() {
  return { ...CALENDAR_SORT_DEFAULT }
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

  const start = normalizeLocalDay(weekStart)

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

  return result
}

function getEventSortValue(event, sortBy) {
  if (!event) return ''

  if (sortBy === 'time') {
    return new Date(event?.startAt || 0).getTime()
  }

  if (sortBy === 'type') {
    return String(event?.type || '')
  }

  if (sortBy === 'team') {
    return String(event?.teamName || event?.team?.teamName || event?.team?.name || '')
  }

  if (sortBy === 'title') {
    return String(event?.title || '')
  }

  return new Date(event?.startAt || 0).getTime()
}

export function sortCalendarEvents(events = [], sort = {}) {
  const sortBy = sort?.by || CALENDAR_SORT_DEFAULT.by
  const direction = sort?.direction || CALENDAR_SORT_DEFAULT.direction
  const factor = direction === 'desc' ? -1 : 1

  return [...events].sort((a, b) => {
    const av = getEventSortValue(a, sortBy)
    const bv = getEventSortValue(b, sortBy)

    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * factor
    }

    return String(av).localeCompare(String(bv), 'he') * factor
  })
}

export function applyCalendarHubSort({
  events = [],
  sort = {},
}) {
  return sortCalendarEvents(events, sort)
}

export function countWeekendEvents(events = []) {
  return events.filter((event) => isWeekendEvent(event)).length
}

export function getActiveCalendarFiltersCount(filters = {}) {
  const defaults = getDefaultCalendarFilters()

  return CALENDAR_FILTER_GROUPS.reduce((total, group) => {
    const groupCount = group.options.reduce((count, option) => {
      return filters?.[option.id] !== defaults?.[option.id]
        ? count + 1
        : count
    }, 0)

    return total + groupCount
  }, 0)
}

export function hasActiveCalendarFilters(filters = {}) {
  return getActiveCalendarFiltersCount(filters) > 0
}

export function buildCalendarFilterResultsText({
  totalCount = 0,
  activeFiltersCount = 0,
}) {
  if (activeFiltersCount > 0) {
    return `${totalCount} אירועים · ${activeFiltersCount} פילטרים פעילים`
  }

  return `${totalCount} אירועים`
}

export function toggleCalendarFilter(filters = {}, key) {
  return {
    ...filters,
    [key]: !filters?.[key],
  }
}

export function getCalendarSortOption(sortBy) {
  const by = sortBy || CALENDAR_SORT_DEFAULT.by

  return CALENDAR_SORT_OPTIONS.find((item) => item.id === by) || CALENDAR_SORT_OPTIONS[0]
}

export function getCalendarSortLabel(sortBy) {
  const option = getCalendarSortOption(sortBy)
  return option?.label || 'שעה'
}

export function getCalendarSortDirectionIcon(direction) {
  return direction === 'desc' ? 'sortDown' : 'sortUp'
}
