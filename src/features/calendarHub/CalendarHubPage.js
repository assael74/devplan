// src/features/calendar/CalendarHubPage.js

import React, { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/joy'

import { calendarHubSx as sx } from './sx/calendarHub.sx'
import useCalendarHubPage from './logic/useCalendarHubPage.js'

import CalendarHubTopBar from './components/CalendarHubTopBar'
import CalendarSelectorPanel from './components/CalendarSelectorPanel'
import WeekCalendarGrid from './components/WeekCalendarGrid'
import EventDrawer from './components/drawer/EventDrawer'

export default function CalendarHubPage() {
  const [initialDraft, setInitialDraft] = useState(null)

  const {
    players,
    teams,
    clubs,
    loading,
    error,

    context,

    view,
    setView,

    days,

    selection,
    setSelectedTeamId,
    setSelectedPlayerId,

    filters,
    setFilters,
    resetFilters,

    visibleEvents,
    allEvents,
    filteredEvents,
    totalCount,
    weekendCount,
    weekStart,

    drawerOpen,
    drawerMode,
    draft,
    setDraft,

    navWeek,
    resetToToday,
    openCreate,
    onEventClick,
    closeDrawer,
    onSaveDraft,
  } = useCalendarHubPage()

  return (
    <Box dir="rtl" sx={sx.page}>
      <Box sx={sx.leftPanel} className="dpScrollThin">
        <CalendarSelectorPanel
          teams={teams}
          players={players}
          context={context}
          selection={selection}
          onSelectTeam={setSelectedTeamId}
          onSelectPlayer={setSelectedPlayerId}
          filters={filters}
          onFilter={setFilters}
          resetFilters={resetFilters}
        />
      </Box>

      <Box sx={sx.rightPanel}>
        <CalendarHubTopBar
          view={view}
          onChangeView={setView}
          totalCount={totalCount}
          weekendCount={weekendCount}
          onPrevWeek={() => navWeek(-1)}
          onToday={resetToToday}
          onNextWeek={() => navWeek(1)}
          onOpenCreate={openCreate}
          onOpenEdit={() => {}}
        />

        <Box sx={sx.calendarBody}>
          {view === 'week' ? (
            <WeekCalendarGrid
              days={days}
              context={context}
              events={visibleEvents}
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
        onClose={closeDrawer}
        draft={draft}
        onDraft={setDraft}
        initialDraft={initialDraft}
        mode={drawerMode}
        onSave={(nextDraft) => {
          console.log('calendar draft save', nextDraft)
          closeDrawer()
        }}
        onDelete={(currentDraft) => {
          console.log('calendar draft delete', currentDraft)
          closeDrawer()
        }}
      />
    </Box>
  )
}
