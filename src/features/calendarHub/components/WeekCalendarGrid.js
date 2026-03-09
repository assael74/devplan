// src/features/calendar/components/WeekCalendarGrid.js
import React, { useMemo } from 'react'
import { Box, Typography, Sheet, Chip } from '@mui/joy'
import { EVENT_TYPES } from '../calendar.mock'
import { weekCalendarGridSx as sx, GRID, buildGridCols } from './WeekCalendarGrid.sx'

const fmtDay = (d) =>
  new Intl.DateTimeFormat('he-IL', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d)

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const minutesFromStart = (dt) => dt.getHours() * 60 + dt.getMinutes() - GRID.hourStart * 60

export default function WeekCalendarGrid({ days, events, calendarsById, onEventClick }) {
  const hours = useMemo(() => {
    const arr = []
    for (let h = GRID.hourStart; h <= GRID.hourEnd; h++) arr.push(h)
    return arr
  }, [])

  const dayEvents = useMemo(
    () => days.map((day) => events.filter((e) => isSameDay(new Date(e.startAt), day))),
    [days, events]
  )

  const gridHeight = (GRID.hourEnd - GRID.hourStart) * 60 * GRID.pxPerMin
  const cols = useMemo(buildGridCols, [])

  return (
    <Box sx={sx.root}>
      <Box sx={sx.scroller}>
        <Box sx={sx.inner}>
          {/* Header (Sticky) */}
          <Box sx={{ ...sx.headerRow, gridTemplateColumns: cols }}>
            <Box sx={sx.headerCorner}>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                שבוע
              </Typography>
            </Box>

            {days.map((d, idx) => {
              const isWeekend = idx >= 5
              const isLast = idx === 6
              return (
                <Box key={d.toISOString()} sx={sx.headerDayCell(isWeekend, isLast)}>
                  {idx === 5 && (
                    <Chip size="sm" variant="soft" sx={sx.weekendBadge}>
                      סופ״ש
                    </Chip>
                  )}
                  <Typography level="title-sm">{fmtDay(d)}</Typography>
                </Box>
              )
            })}
          </Box>

          {/* Body */}
          <Box sx={{ ...sx.bodyGrid, gridTemplateColumns: cols, minHeight: gridHeight }}>
            {/* Time column (Sticky) */}
            <Box sx={sx.timeCol}>
              {hours.map((h) => (
                <Box key={h} sx={sx.timeCell(h)}>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    {String(h).padStart(2, '0')}:00
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            {days.map((day, idx) => {
              const isWeekend = idx >= 5
              const isLast = idx === 6
              const colEvents = dayEvents[idx] || []

              return (
                <Box key={day.toISOString()} sx={sx.dayCol(isWeekend, isLast, gridHeight)}>
                  {/* hour lines */}
                  {hours.map((h) => (
                    <Box key={h} sx={sx.hourLine((h - GRID.hourStart) * 60 * GRID.pxPerMin)} />
                  ))}

                  {/* weekend separator */}
                  {idx === 5 && <Box sx={sx.weekendSeparator} />}

                  {/* events */}
                  {colEvents.map((e) => {
                    const cal = calendarsById[e.calendarId] || {}
                    const start = new Date(e.startAt)
                    const end = new Date(e.endAt)

                    const top = clamp(minutesFromStart(start) * GRID.pxPerMin, 0, gridHeight - 24)
                    const height = clamp(((end - start) / 60000) * GRID.pxPerMin, 22, gridHeight - top)

                    const et = EVENT_TYPES[e.type] || { label: e.type, icon: '•' }

                    return (
                      <Sheet
                        key={e.id}
                        variant="soft"
                        sx={sx.eventCard(top, height)}
                        onClick={() => onEventClick(e)}
                      >
                        <Box sx={sx.eventTitleRow}>
                          <Typography level="body-sm">{et.icon}</Typography>
                          <Typography level="title-sm" sx={sx.eventTitle}>
                            {e.title}
                          </Typography>
                        </Box>

                        <Box sx={sx.eventMetaRow}>
                          <Chip size="sm" variant="soft" color={cal.color || 'neutral'}>
                            {et.label}
                          </Chip>
                        </Box>
                      </Sheet>
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
