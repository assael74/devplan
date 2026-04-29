// features/calendarHub/components/desktop/CalendarHubDesktop.js

import React, { useMemo, useCallback, useState } from 'react'
import { Box, Typography } from '@mui/joy'
import { useLocation } from 'react-router-dom'

import { hubSx as sx } from '../../sx/hub.sx.js'
import useCalendarHubPage from '../../logic/useCalendarHubPage.js'

import CalendarHubTopBar from './CalendarHubTopBar.js'
import CalendarSelectorPanel from './CalendarSelectorPanel.js'
import WeekCalendarGrid from './WeekCalendarGrid.js'
import EventDrawer from './drawer/EventDrawer.js'

import CalendarHubFabMenu from '../../sharedUi/CalendarHubFabMenu.js'

import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider.js'
import { buildTaskFabContext } from '../../../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

export default function CalendarHubDesktop() {
  const [initialDraft] = useState(null)

  const location = useLocation()
  const { openCreate } = useCreateModal()

  const {
    teams,
    players,

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
    totalCount,
    weekendCount,

    drawerOpen,
    drawerMode,
    draft,
    setDraft,

    navWeek,
    resetToToday,
    openCreate: openCalendarCreate,
    onEventClick,
    closeDrawer,
  } = useCalendarHubPage()

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'calendar',
      mode: view,
      extra: context,
    })
  }, [location, view, context])

  const onAddTask = useCallback((nextTaskContext = {}) => {
    openCreate(
      'task',
      buildTaskPresetDraft(nextTaskContext),
      { ...context, ...nextTaskContext },
    )
  }, [openCreate, context])

  const onAddMeeting = useCallback(() => {
    openCalendarCreate()
  }, [openCalendarCreate])

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
          onOpenCreate={openCalendarCreate}
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
              <Typography level="title-md">
                תצוגה זו ב-UI בהמשך
              </Typography>

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

      <CalendarHubFabMenu
        taskContext={taskContext}
        onAddTask={onAddTask}
        onAddMeeting={onAddMeeting}
      />
    </Box>
  )
}
