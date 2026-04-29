// src/features/calendar/logic/useCalendarHubPage.js

import { useMemo, useState } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'

import { buildCalendarEventsDomain } from '../../../shared/calendar/calendar.hub.builders.js'

import {
  addDays,
  toISODate,
  buildWeekDays,
  startOfWeekSunday,
  countWeekendEvents,
  filterEventsByWeek,
  getBestEventWeekStart,
  applyCalendarHubFilters,
  applyCalendarHubSort,
  getDefaultCalendarFilters,
  getDefaultCalendarSort,
  normalizeLocalDay,
  isSameLocalDay,
  getActiveCalendarFiltersCount,
  hasActiveCalendarFilters,
  buildCalendarFilterResultsText,
} from './calendarHub.helpers.js'

function getVisibleWeekDays(weekDays, filters) {
  const showWeekend = filters?.weekend !== false
  const showWeekday = filters?.weekday !== false

  if (showWeekend && showWeekday) {
    return weekDays
  }

  if (showWeekend && !showWeekday) {
    return weekDays.filter((day) => {
      const jsDay = day.getDay()
      return jsDay === 5 || jsDay === 6
    })
  }

  if (!showWeekend && showWeekday) {
    return weekDays.filter((day) => {
      const jsDay = day.getDay()
      return jsDay >= 0 && jsDay <= 4
    })
  }

  return []
}

export default function useCalendarHubPage() {
  const { players, teams, clubs, loading, error } = useCoreData()

  const context = useMemo(() => {
    return { players, teams, clubs }
  }, [players, teams, clubs])

  const [selection, setSelection] = useState({
    teamId: '',
    playerId: '',
  })

  const [view, setView] = useState('week')
  const [weekStart, setWeekStart] = useState(() => startOfWeekSunday(new Date()))
  const [selectedDay, setSelectedDayState] = useState(() => normalizeLocalDay(new Date()))
  const [filters, setFilters] = useState(() => getDefaultCalendarFilters())
  const [sort, setSort] = useState(() => getDefaultCalendarSort())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('create')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [draft, setDraft] = useState({
    type: 'meeting',
    title: '',
    date: '',
    time: '',
    durationMin: 45,
    status: 'planned',
    teamId: '',
    playerId: '',
  })

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart])

  const visibleDays = useMemo(() => {
    return getVisibleWeekDays(weekDays, filters)
  }, [weekDays, filters])

  const allEvents = useMemo(() => {
    return buildCalendarEventsDomain({
      teams,
      players,
      clubs,
      context,
    })
  }, [teams, players, clubs, context])

  const filteredEvents = useMemo(() => {
    return applyCalendarHubFilters({
      events: allEvents,
      selection,
      filters,
      players,
    })
  }, [allEvents, selection, filters, players])

  const visibleEvents = useMemo(() => {
    const weekEvents = filterEventsByWeek(filteredEvents, weekStart)

    const dayVisibleEvents = weekEvents.filter((event) => {
      const eventDate = new Date(event?.startAt)
      return visibleDays.some((day) => isSameLocalDay(day, eventDate))
    })

    return applyCalendarHubSort({
      events: dayVisibleEvents,
      sort,
    })
  }, [filteredEvents, weekStart, visibleDays, sort])

  const totalCount = visibleEvents.length
  const weekendCount = countWeekendEvents(visibleEvents)

  const activeFiltersCount = useMemo(() => {
    return getActiveCalendarFiltersCount(filters)
  }, [filters])

  const hasActiveFilters = useMemo(() => {
    return hasActiveCalendarFilters(filters)
  }, [filters])

  const filterResultsText = useMemo(() => {
    return buildCalendarFilterResultsText({
      totalCount,
      activeFiltersCount,
    })
  }, [totalCount, activeFiltersCount])

  function setSelectedTeamId(teamId) {
    const nextSelection = {
      teamId: teamId || '',
      playerId: '',
    }

    setSelection(nextSelection)

    const nextFilteredEvents = applyCalendarHubFilters({
      events: allEvents,
      selection: nextSelection,
      filters,
      players,
    })

    const nextWeekStart = getBestEventWeekStart(nextFilteredEvents)

    if (nextWeekStart) {
      const normalizedWeekStart = startOfWeekSunday(nextWeekStart)
      setWeekStart(normalizedWeekStart)
      setSelectedDayState(normalizedWeekStart)
    }
  }

  function setSelectedPlayerId(playerId) {
    const player = (players || []).find((item) => item?.id === playerId)

    const nextSelection = {
      teamId: playerId ? player?.teamId || '' : '',
      playerId: playerId || '',
    }

    setSelection(nextSelection)

    const nextFilteredEvents = applyCalendarHubFilters({
      events: allEvents,
      selection: nextSelection,
      filters,
      players,
    })

    const nextWeekStart = getBestEventWeekStart(nextFilteredEvents)

    if (nextWeekStart) {
      const normalizedWeekStart = startOfWeekSunday(nextWeekStart)
      setWeekStart(normalizedWeekStart)
      setSelectedDayState(normalizedWeekStart)
    }
  }

  function setSelectedDay(day) {
    const nextDay = normalizeLocalDay(day)
    const nextWeekStart = startOfWeekSunday(nextDay)

    setSelectedDayState(nextDay)

    if (!isSameLocalDay(nextWeekStart, weekStart)) {
      setWeekStart(nextWeekStart)
    }
  }

  function navWeek(dir) {
    const nextWeekStart = addDays(weekStart, dir * 7)
    const normalizedWeekStart = startOfWeekSunday(nextWeekStart)

    setWeekStart(normalizedWeekStart)
    setSelectedDayState(normalizedWeekStart)
  }

  function resetFilters() {
    const next = getDefaultCalendarFilters()
    setFilters({ ...next })
  }

  function resetToToday() {
    const today = normalizeLocalDay(new Date())

    setWeekStart(startOfWeekSunday(today))
    setSelectedDayState(today)
  }

  function setSortBy(nextSortBy) {
    setSort((prev) => ({
      ...prev,
      by: nextSortBy,
    }))
  }

  function setSortDirection(nextDirection) {
    setSort((prev) => ({
      ...prev,
      direction: nextDirection,
    }))
  }

  function openCreate() {
    setDrawerMode('create')
    setSelectedEvent(null)

    setDraft({
      type: 'meeting',
      title: '',
      date: toISODate(selectedDay || new Date()),
      time: '',
      durationMin: 45,
      status: 'planned',
      teamId: selection?.teamId || '',
      playerId: selection?.playerId || '',
    })

    setDrawerOpen(true)
  }

  function onEventClick(event) {
    setDrawerMode('edit')
    setSelectedEvent(event)

    const start = new Date(event.startAt)
    const hh = String(start.getHours()).padStart(2, '0')
    const mm = String(start.getMinutes()).padStart(2, '0')

    setDraft({
      type: event?.type || 'meeting',
      title: event?.title || '',
      date: toISODate(start),
      time: `${hh}:${mm}`,
      durationMin: Math.max(
        15,
        Math.round((new Date(event.endAt) - start) / 60000)
      ),
      status: event?.status || 'planned',
      teamId: event?.teamId || '',
      playerId: event?.playerId || '',
    })

    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function onSaveDraft() {
    if (draft.type === 'game' && !draft.time) {
      alert('במשחק שדה שעה הוא חובה')
      return
    }

    setDrawerOpen(false)
  }

  return {
    players,
    teams,
    clubs,
    loading,
    error,

    context,

    view,
    setView,

    weekStart,
    weekDays,
    days: visibleDays,

    selectedDay,
    setSelectedDay,

    selection,
    setSelectedTeamId,
    setSelectedPlayerId,

    filters,
    setFilters,
    resetFilters,
    activeFiltersCount,
    hasActiveFilters,
    filterResultsText,

    sort,
    setSortBy,
    setSortDirection,

    visibleEvents,
    filteredEvents,
    allEvents,
    totalCount,
    weekendCount,

    drawerOpen,
    drawerMode,
    selectedEvent,
    draft,
    setDraft,

    navWeek,
    resetToToday,
    openCreate,
    onEventClick,
    closeDrawer,
    onSaveDraft,
  }
}
