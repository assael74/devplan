// src/features/calendar/components/WeekCalendarGrid.js

import React, { useMemo } from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { weekCalendarGridSx as sx, GRID, buildGridCols } from '../sx/WeekCalendarGrid.sx'
import CalendarEventItem from './items/CalendarEventItem.js'

const fmtDay = (d) =>
  new Intl.DateTimeFormat('he-IL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(d)

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const minutesFromStart = (dt) =>
  dt.getHours() * 60 + dt.getMinutes() - GRID.hourStart * 60

const isWeekendDay = (day) => {
  const jsDay = day.getDay()
  return jsDay === 5 || jsDay === 6
}

export default function WeekCalendarGrid({ days = [], events = [], onEventClick }) {
  const safeDays = Array.isArray(days) && days.length ? days : []
  const daysCount = safeDays.length || 7

  const hours = useMemo(() => {
    const arr = []
    for (let h = GRID.hourStart; h <= GRID.hourEnd; h += 1) arr.push(h)
    return arr
  }, [])

  const dayEvents = useMemo(() => {
    return safeDays.map((day) =>
      events.filter((e) => isSameDay(new Date(e.startAt), day))
    )
  }, [safeDays, events])

  const gridHeight = (GRID.hourEnd - GRID.hourStart) * 60 * GRID.pxPerMin
  const cols = useMemo(() => buildGridCols(daysCount), [daysCount])

  const hasOnlyWeekendDays =
    safeDays.length > 0 && safeDays.every((day) => isWeekendDay(day))
  //console.log(dayEvents)
  return (
    <Box sx={sx.root}>
      <Box sx={sx.scroller}>
        <Box sx={sx.inner}>
          <Box sx={{ ...sx.headerRow, gridTemplateColumns: cols }}>
            <Box sx={sx.headerCorner}>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                שבוע
              </Typography>
            </Box>

            {safeDays.map((day, idx) => {
              const isWeekend = isWeekendDay(day)
              const isLast = idx === safeDays.length - 1

              return (
                <Box key={day.toISOString()} sx={sx.headerDayCell(isWeekend, isLast)}>
                  {hasOnlyWeekendDays && idx === 0 && (
                    <Chip size="sm" variant="soft" sx={sx.weekendBadge}>
                      סופ״ש
                    </Chip>
                  )}

                  <Typography level="title-sm" noWrap>
                    {fmtDay(day)}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          <Box sx={{ ...sx.bodyGrid, gridTemplateColumns: cols, minHeight: gridHeight }}>
            <Box sx={sx.timeCol}>
              {hours.map((h) => (
                <Box key={h} sx={sx.timeCell()}>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    {String(h).padStart(2, '0')}:00
                  </Typography>
                </Box>
              ))}
            </Box>

            {safeDays.map((day, idx) => {
              const isWeekend = isWeekendDay(day)
              const isLast = idx === safeDays.length - 1
              const colEvents = dayEvents[idx] || []

              return (
                <Box key={day.toISOString()} sx={sx.dayCol(isWeekend, isLast, gridHeight)}>
                  {hours.map((h) => (
                    <Box
                      key={h}
                      sx={sx.hourLine((h - GRID.hourStart) * 60 * GRID.pxPerMin)}
                    />
                  ))}

                  {hasOnlyWeekendDays && idx === 0 && <Box sx={sx.weekendSeparator} />}

                  {colEvents.map((event) => {
                    const start = new Date(event.startAt)
                    const end = new Date(event.endAt)

                    const top = clamp(
                      minutesFromStart(start) * GRID.pxPerMin,
                      0,
                      gridHeight - 24
                    )

                    const height = clamp(
                      ((end - start) / 60000) * GRID.pxPerMin,
                      22,
                      gridHeight - top
                    )

                    return (
                      <CalendarEventItem
                        key={event.id}
                        event={event}
                        top={top}
                        height={height}
                        onClick={onEventClick}
                      />
                    )
                  })}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
