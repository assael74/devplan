// src/features/calendar/components/WeekCalendarGrid.js

import React, { useMemo } from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { weekCalendarGridSx as sx, GRID, buildGridCols } from './sx/WeekCalendarGrid.sx'
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

function toEventWindow(event) {
  const start = new Date(event?.startAt)
  const end = new Date(event?.endAt)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  const startMin = start.getHours() * 60 + start.getMinutes()
  const endMinRaw = end.getHours() * 60 + end.getMinutes()
  const endMin = Math.max(endMinRaw, startMin + 1)

  return {
    event,
    start,
    end,
    startMin,
    endMin,
  }
}

function isOverlap(a, b) {
  return a.startMin < b.endMin && b.startMin < a.endMin
}

function buildOverlapLayout(dayEvents = []) {
  const windows = dayEvents
    .map(toEventWindow)
    .filter(Boolean)
    .sort((a, b) => {
      if (a.startMin !== b.startMin) return a.startMin - b.startMin
      return a.endMin - b.endMin
    })

  if (!windows.length) return []

  const groups = []
  let currentGroup = []
  let currentGroupEnd = -1

  windows.forEach((item) => {
    if (!currentGroup.length) {
      currentGroup = [item]
      currentGroupEnd = item.endMin
      return
    }

    if (item.startMin < currentGroupEnd) {
      currentGroup.push(item)
      currentGroupEnd = Math.max(currentGroupEnd, item.endMin)
      return
    }

    groups.push(currentGroup)
    currentGroup = [item]
    currentGroupEnd = item.endMin
  })

  if (currentGroup.length) groups.push(currentGroup)

  const laidOut = []

  groups.forEach((group) => {
    const columns = []

    group.forEach((item) => {
      let placedCol = -1

      for (let i = 0; i < columns.length; i += 1) {
        const lastInCol = columns[i][columns[i].length - 1]
        if (!isOverlap(lastInCol, item)) {
          placedCol = i
          break
        }
      }

      if (placedCol === -1) {
        columns.push([item])
        placedCol = columns.length - 1
      } else {
        columns[placedCol].push(item)
      }

      item._col = placedCol
    })

    const totalCols = columns.length || 1

    group.forEach((item) => {
      laidOut.push({
        ...item.event,
        overlapColumn: item._col,
        overlapColumnsTotal: totalCols,
      })
    })
  })

  return laidOut
}

export default function WeekCalendarGrid({ days = [], events = [], onEventClick, context }) {
  const safeDays = Array.isArray(days) && days.length ? days : []
  const daysCount = safeDays.length || 7

  const hours = useMemo(() => {
    const arr = []
    for (let h = GRID.hourStart; h <= GRID.hourEnd; h += 1) arr.push(h)
    return arr
  }, [])

  const dayEvents = useMemo(() => {
    return safeDays.map((day) => {
      const raw = events.filter((e) => isSameDay(new Date(e.startAt), day))
      return buildOverlapLayout(raw)
    })
  }, [safeDays, events])

  const gridHeight = (GRID.hourEnd - GRID.hourStart) * 60 * GRID.pxPerMin
  const cols = useMemo(() => buildGridCols(daysCount), [daysCount])

  const hasOnlyWeekendDays =
    safeDays.length > 0 && safeDays.every((day) => isWeekendDay(day))

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

                    const total = Math.max(1, Number(event?.overlapColumnsTotal || 1))
                    const col = Math.max(0, Number(event?.overlapColumn || 0))
                    const widthPct = 100 / total
                    const leftPct = col * widthPct

                    return (
                      <CalendarEventItem
                        key={event.id}
                        event={event}
                        top={top}
                        height={height}
                        leftPct={leftPct}
                        widthPct={widthPct}
                        stackIndex={col}
                        context={context}
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
