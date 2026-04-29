// features/calendarHub/components/mobile/CalendarHubMobile.js

import React, { useMemo, useCallback, useState } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { useLocation } from 'react-router-dom'

import useCalendarHubPage from '../../logic/useCalendarHubPage.js'
import CalendarHubFabMenu from '../../sharedUi/CalendarHubFabMenu.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import CalendarMobileAgenda from './CalendarMobileAgenda.js'
import CalendarMobileDayStrip from './CalendarMobileDayStrip.js'
import CalendarMobileFiltersDrawer from './CalendarMobileFiltersDrawer.js'

import FiltersTrigger from '../../../../ui/patterns/filters/FiltersTrigger.js'
import SortDrawerMobile from '../../../../ui/patterns/sort/SortDrawerMobile.js'

import {
  CALENDAR_SORT_OPTIONS,
} from '../../logic/calendarHub.constants.js'

import {
  getCalendarSortLabel,
  getCalendarSortDirectionIcon,
} from '../../logic/calendarHub.helpers.js'

import { useCreateModal } from '../../../../ui/forms/create/CreateModalProvider.js'
import { buildTaskFabContext } from '../../../../ui/actions/buildTaskFabContext.js'
import { buildTaskPresetDraft } from '../../../../ui/forms/helpers/tasksForm.helpers.js'

import { hubSx as sx } from './sx/hub.sx'

export default function CalendarHubMobile() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const location = useLocation()
  const { openCreate } = useCreateModal()

  const {
    context,

    view,

    days,
    selectedDay,
    setSelectedDay,

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
    totalCount,
    weekendCount,

    navWeek,
    resetToToday,
    openCreate: openCalendarCreate,
    onEventClick,
  } = useCalendarHubPage()

  const taskContext = useMemo(() => {
    return buildTaskFabContext({
      location,
      area: 'calendar',
      mode: view,
      extra: context,
    })
  }, [location, view, context])

  const resetDisabled = activeFiltersCount <= 0

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
    <Box sx={sx.root}>
      <Box sx={sx.sticky}>
        <Box sx={{ px: 1.25, py: 1 }}>
          <Typography level="title-lg">
            יומן
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            {totalCount} אירועים השבוע · {weekendCount} בסופ״ש
          </Typography>

          <Box sx={sx.butWrap}>
            <Button
              size="sm"
              variant="soft"
              onClick={() => navWeek(-1)}
              sx={{ flexShrink: 0 }}
            >
              שבוע קודם
            </Button>

            <Button
              size="sm"
              variant="soft"
              onClick={resetToToday}
              sx={{ flexShrink: 0 }}
            >
              היום
            </Button>

            <Button
              size="sm"
              variant="soft"
              onClick={() => navWeek(1)}
              sx={{ flexShrink: 0 }}
            >
              שבוע הבא
            </Button>

            <Button
              size="sm"
              variant="solid"
              onClick={openCalendarCreate}
              sx={{ flexShrink: 0, marginInlineStart: 'auto' }}
            >
              אירוע
            </Button>
          </Box>

          <Box sx={sx.trigWrap}>
            <FiltersTrigger
              hasActive={hasActiveFilters}
              onClick={() => setFiltersOpen(true)}
              label="פילטרים"
            />

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={() => setSortOpen(true)}
              endDecorator={iconUi({
                id: getCalendarSortDirectionIcon(sort?.direction),
                sx: { fontSize: 15, color: '#1ED760' },
              })}
              sx={sx.sortButt}
            >
              מיון: {getCalendarSortLabel(sort?.by)}
            </Button>

            {activeFiltersCount > 0 ? (
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {activeFiltersCount} פעילים
              </Typography>
            ) : null}
          </Box>
        </Box>

        <CalendarMobileDayStrip
          days={days}
          events={visibleEvents}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </Box>

      <Box className="dpScrollThin" sx={sx.scroll}>
        <CalendarMobileAgenda
          days={days}
          events={visibleEvents}
          selectedDay={selectedDay}
          context={context}
          onEventClick={onEventClick}
        />
      </Box>

      <CalendarMobileFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilter={setFilters}
        onReset={resetFilters}
        resetDisabled={resetDisabled}
        resultsText={filterResultsText}
      />

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון יומן"
        sortBy={sort?.by}
        sortDirection={sort?.direction}
        sortOptions={CALENDAR_SORT_OPTIONS}
        onChangeSortBy={setSortBy}
        onChangeSortDirection={setSortDirection}
      />

      <CalendarHubFabMenu
        taskContext={taskContext}
        onAddTask={onAddTask}
        onAddMeeting={onAddMeeting}
      />
    </Box>
  )
}
