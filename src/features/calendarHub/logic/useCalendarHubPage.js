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
  getDefaultCalendarFilters,
} from './calendarHub.helpers.js'

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

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

  const context = { players, teams, clubs }

  const [selection, setSelection] = useState({
    teamId: '',
    playerId: '',
  })

  const [view, setView] = useState('week')
  const [weekStart, setWeekStart] = useState(() => startOfWeekSunday(new Date()))
  const [filters, setFilters] = useState(() => getDefaultCalendarFilters())

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

    return weekEvents.filter((event) => {
      const eventDate = new Date(event?.startAt)
      return visibleDays.some((day) => isSameDay(day, eventDate))
    })
  }, [filteredEvents, weekStart, visibleDays])

  const totalCount = visibleEvents.length
  const weekendCount = countWeekendEvents(visibleEvents)

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
      setWeekStart(nextWeekStart)
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
      setWeekStart(nextWeekStart)
    }
  }

  function navWeek(dir) {
    setWeekStart((prev) => addDays(prev, dir * 7))
  }

  function resetFilters() {
    const next = getDefaultCalendarFilters()
    setFilters({ ...next })
  }

  function resetToToday() {
    setWeekStart(startOfWeekSunday(new Date()))
  }

  function openCreate() {
    setDrawerMode('create')
    setSelectedEvent(null)

    setDraft({
      type: 'meeting',
      title: '',
      date: toISODate(new Date()),
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

    selection,
    setSelectedTeamId,
    setSelectedPlayerId,

    filters,
    setFilters,
    resetFilters,

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
