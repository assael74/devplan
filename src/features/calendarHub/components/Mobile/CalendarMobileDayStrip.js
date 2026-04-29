// features/calendarHub/components/mobile/CalendarMobileDayStrip.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import {
  isSameLocalDay,
  normalizeLocalDay,
} from '../../logic/calendarHub.helpers.js'

import { hubSx as sx } from './sx/hub.sx'

function formatDayName(day) {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'short',
  }).format(day)
}

function formatDayNumber(day) {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
  }).format(day)
}

function countEventsForDay(events = [], day) {
  const safeEvents = Array.isArray(events) ? events : []

  return safeEvents.filter((event) => {
    if (!event?.startAt) return false
    return isSameLocalDay(event.startAt, day)
  }).length
}

export default function CalendarMobileDayStrip({
  days = [],
  events = [],
  selectedDay,
  onSelectDay,
}) {
  const items = useMemo(() => {
    const safeDays = Array.isArray(days) ? days : []

    return safeDays.map((day) => {
      const normalizedDay = normalizeLocalDay(day)

      return {
        id: normalizedDay.toISOString(),
        day: normalizedDay,
        dayName: formatDayName(normalizedDay),
        dayNumber: formatDayNumber(normalizedDay),
        count: countEventsForDay(events, normalizedDay),
        active: selectedDay
          ? isSameLocalDay(selectedDay, normalizedDay)
          : false,
        today: isSameLocalDay(new Date(), normalizedDay),
      }
    })
  }, [days, events, selectedDay])

  if (!items.length) return null

  return (
    <Box sx={sx.dayWrap}>
      {items.map((item) => (
        <Box key={item.id} onClick={() => onSelectDay(item.day)} sx={sx.clickBox(item)}>
          <Typography level="body-xs" sx={sx.typoBody(item)}>
            {item.dayName}
          </Typography>

          <Typography level="title-sm" sx={sx.typoTitle(item)}>
            {item.dayNumber}
          </Typography>

          <Typography level="body-xs" sx={sx.typoBody(item)}>
            {item.count}
          </Typography>

          {item.today ? (
            <Box sx={sx.itemDay} />
          ) : null}
        </Box>
      ))}
    </Box>
  )
}
