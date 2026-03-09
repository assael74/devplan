// src/features/calendar/CalendarHubPage.js
import React, { useMemo, useState } from 'react'
import { Box, Typography, Button, IconButton, Chip, ButtonGroup } from '@mui/joy'
import AddRounded from '@mui/icons-material/AddRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import TodayRounded from '@mui/icons-material/TodayRounded'

import { calendarHubSx } from './calendarHub.sx'
import CalendarSelectorPanel from './components/CalendarSelectorPanel'
import WeekCalendarGrid from './components/WeekCalendarGrid'
import EventDrawer from './components/EventDrawer'
import { MOCK_CALENDARS, mockBuildEvents } from './calendar.mock'

function startOfWeekSunday(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  // JS: 0=Sunday
  const diff = x.getDay() // already sunday-based
  x.setDate(x.getDate() - diff)
  return x
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function toISODate(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const yyyy = x.getFullYear()
  const mm = String(x.getMonth() + 1).padStart(2, '0')
  const dd = String(x.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function CalendarHubPage() {
  const sx = calendarHubSx()

  const [view, setView] = useState('week') // month | week | agenda (כרגע week בלבד)
  const [weekStart, setWeekStart] = useState(() => startOfWeekSunday(new Date()))

  const [activeCalendarIds, setActiveCalendarIds] = useState([
    'team_kadima_u14',
    'staff_assael',
  ])

  const [filters, setFilters] = useState({
    onlyWeekend: false,
    onlyMatches: false,
    onlyMeetings: false,
  })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('create')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [draft, setDraft] = useState({
    type: 'meeting_player',
    calendarId: 'staff_assael',
    title: '',
    date: '',
    time: '',
    durationMin: 45,
    status: 'planned',
  })

  const calendars = useMemo(() => MOCK_CALENDARS, [])
  const calendarsById = useMemo(() => {
    const m = {}
    calendars.forEach((c) => (m[c.id] = c))
    return m
  }, [calendars])

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const allEvents = useMemo(() => mockBuildEvents(weekStart), [weekStart])

  const visibleEvents = useMemo(() => {
    const act = new Set(activeCalendarIds)
    let arr = allEvents.filter((e) => act.has(e.calendarId))

    if (filters.onlyWeekend) {
      arr = arr.filter((e) => {
        const day = new Date(e.startAt).getDay() // 0 Sun ... 6 Sat
        return day === 5 || day === 6
      })
    }
    if (filters.onlyMatches) arr = arr.filter((e) => e.type === 'match')
    if (filters.onlyMeetings) arr = arr.filter((e) => e.type === 'meeting_player' || e.type === 'meeting_team')

    return arr
  }, [allEvents, activeCalendarIds, filters])

  const totalCount = visibleEvents.length
  const weekendCount = visibleEvents.filter((e) => {
    const d = new Date(e.startAt).getDay()
    return d === 5 || d === 6
  }).length

  const handleToggleCalendar = (id) => {
    setActiveCalendarIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const navWeek = (dir) => {
    setWeekStart((prev) => addDays(prev, dir * 7))
  }

  const openCreate = () => {
    setDrawerMode('create')
    setSelectedEvent(null)
    setDraft((d) => ({
      ...d,
      title: '',
      date: toISODate(new Date()),
      time: '',
      durationMin: 45,
      status: 'planned',
    }))
    setDrawerOpen(true)
  }

  const onEventClick = (e) => {
    setDrawerMode('edit')
    setSelectedEvent(e)
    const start = new Date(e.startAt)
    const hh = String(start.getHours()).padStart(2, '0')
    const mm = String(start.getMinutes()).padStart(2, '0')
    setDraft({
      type: e.type,
      calendarId: e.calendarId,
      title: e.title || '',
      date: toISODate(start),
      time: `${hh}:${mm}`,
      durationMin: Math.max(15, Math.round((new Date(e.endAt) - start) / 60000)),
      status: e.status || 'planned',
    })
    setDrawerOpen(true)
  }

  const onSaveDraft = () => {
    if (draft.type === 'match' && !draft.time) {
      alert('במשחק שדה שעה הוא חובה')
      return
    }
    setDrawerOpen(false)
  }

  return (
    <Box dir="rtl" sx={sx.page}>
      {/* Left panel: selector */}
      <Box sx={sx.leftPanel} className="dpScrollThin">
        <CalendarSelectorPanel
          calendars={calendars}
          activeIds={activeCalendarIds}
          onToggle={handleToggleCalendar}
          filters={filters}
          onFilter={setFilters}
        />
      </Box>

      {/* Right panel: calendar */}
      <Box sx={sx.rightPanel}>
        <Box sx={sx.topBar}>
          <Box sx={sx.titleBlock}>
            <Typography level="title-lg">יומן</Typography>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Overlay של יומנים (קבוצות + אנליסטים) לתיאום וזמינות
            </Typography>
          </Box>

          <ButtonGroup size="sm" variant="soft" sx={sx.buttonGroup}>
            <Button variant={view === 'month' ? 'solid' : 'soft'} onClick={() => setView('month')}>
              חודש
            </Button>
            <Button variant={view === 'week' ? 'solid' : 'soft'} onClick={() => setView('week')}>
              שבוע
            </Button>
            <Button variant={view === 'agenda' ? 'solid' : 'soft'} onClick={() => setView('agenda')}>
              אג׳נדה
            </Button>
          </ButtonGroup>

          <Box sx={sx.actions}>
            <Box sx={sx.chips}>
              <Chip size="sm" variant="soft">
                סה״כ: {totalCount}
              </Chip>
              <Chip size="sm" variant="soft">
                סופ״ש: {weekendCount}
              </Chip>
            </Box>

            <IconButton size="sm" variant="soft" onClick={() => navWeek(-1)}>
              <ChevronRightRounded />
            </IconButton>
            <IconButton size="sm" variant="soft" onClick={() => setWeekStart(startOfWeekSunday(new Date()))}>
              <TodayRounded />
            </IconButton>
            <IconButton size="sm" variant="soft" onClick={() => navWeek(1)}>
              <ChevronLeftRounded />
            </IconButton>

            <Button size="sm" startDecorator={<AddRounded />} onClick={openCreate}>
              אירוע
            </Button>
          </Box>
        </Box>

        <Box sx={sx.calendarBody}>
          {view === 'week' ? (
            <WeekCalendarGrid
              weekStart={weekStart}
              days={days}
              events={visibleEvents}
              calendarsById={calendarsById}
              onEventClick={onEventClick}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography level="title-md">תצוגה זו ב-UI בהמשך</Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                כרגע מיושם Week View כי זה ה-use case הקריטי לתיאום וזמינות.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <EventDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        draft={draft}
        onDraft={setDraft}
        calendars={calendars}
        mode={drawerMode}
        onSave={onSaveDraft}
      />
    </Box>
  )
}
