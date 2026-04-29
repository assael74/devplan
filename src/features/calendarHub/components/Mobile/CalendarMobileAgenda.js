// features/calendarHub/components/mobile/CalendarMobileAgenda.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import CalendarMobileEventCard from './card/CalendarMobileEventCard.js'

import {
  isSameLocalDay,
  normalizeLocalDay,
} from '../../logic/calendarHub.helpers.js'

import { hubSx as sx } from './sx/hub.sx'

function formatDayTitle(day) {
  if (!day) return ''

  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  }).format(day)
}

function sortEvents(events = []) {
  return [...events].sort((a, b) => {
    return new Date(a?.startAt || 0) - new Date(b?.startAt || 0)
  })
}

function buildDayGroups(days = [], events = [], selectedDay = null) {
  const safeDays = Array.isArray(days) ? days : []
  const safeEvents = Array.isArray(events) ? events : []

  const normalizedSelectedDay = selectedDay
    ? normalizeLocalDay(selectedDay)
    : null

  const visibleDays = normalizedSelectedDay
    ? safeDays.filter((day) => isSameLocalDay(day, normalizedSelectedDay))
    : safeDays

  return visibleDays.map((day) => {
    const normalizedDay = normalizeLocalDay(day)

    const dayEvents = safeEvents.filter((event) => {
      if (!event?.startAt) return false
      return isSameLocalDay(event.startAt, normalizedDay)
    })

    return {
      day: normalizedDay,
      id: normalizedDay.toISOString(),
      title: formatDayTitle(normalizedDay),
      isToday: isSameLocalDay(new Date(), normalizedDay),
      events: sortEvents(dayEvents),
    }
  })
}

export default function CalendarMobileAgenda({
  days = [],
  events = [],
  selectedDay,
  context,
  onEventClick,
}) {
  const groups = useMemo(() => {
    return buildDayGroups(days, events, selectedDay)
  }, [days, events, selectedDay])

  const activeGroup = groups[0] || null

  if (!activeGroup) {
    return (
      <Box sx={sx.empty}>
        <Typography level="title-sm">
          אין יום להצגה
        </Typography>

        <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>
          בדוק את פילטר הימים או עבור לשבוע אחר.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={sx.wrapBox}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" noWrap>
            {activeGroup.title}
          </Typography>

          {activeGroup.isToday ? (
            <Typography level="body-xs" sx={{ color: 'primary.500', fontWeight: 800, mt: 0.15 }}>
              היום
            </Typography>
          ) : null}
        </Box>

        <Chip size="sm" variant="soft" color="neutral">
          {activeGroup.events.length} אירועים
        </Chip>
      </Box>

      {activeGroup.events.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {activeGroup.events.map((event) => (
            <CalendarMobileEventCard
              key={event?.id}
              event={event}
              context={context}
              onClick={onEventClick}
            />
          ))}
        </Box>
      ) : (
        <Box sx={sx.empty}>
          <Typography level="title-sm">
            אין אירועים ביום הזה
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            אפשר לבחור יום אחר, לעבור שבוע או ליצור אירוע חדש.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
