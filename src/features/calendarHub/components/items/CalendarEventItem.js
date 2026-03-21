// src/features/calendar/components/items/CalendarEventItem.js

import React from 'react'
import { Box, Typography, Sheet, Chip, Tooltip } from '@mui/joy'

import { CALENDAR_EVENT_TYPES } from '../../logic/calendarHub.constants.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  buildGameTooltipLabel,
  formatCalendarEventTime,
  buildCalendarEventSubtitle,
  buildCalendarEventMetaLabel,
} from '../../logic/calendarEventItem.helpers.js'

import { calendarEventItemSx as sx } from '../../sx/calendarEventItem.sx.js'

export default function CalendarEventItem({
  event,
  top = 0,
  height = 40,
  onClick,
}) {
  if (!event) return null

  const typeMeta = CALENDAR_EVENT_TYPES[event?.type] || {
    id: event?.type || 'event',
    label: 'אירוע',
    idIcon: 'calendar',
    color: 'neutral',
  }

  const iconId = typeMeta?.idIcon || 'calendar'
  const timeLabel = formatCalendarEventTime(event?.startAt, event?.endAt)
  const subtitle = buildCalendarEventSubtitle(event)
  const metaLabel = buildCalendarEventMetaLabel(event)
  const tooltip = event?.type === 'game' ? buildGameTooltipLabel(event) : ''

  const isCompact = height < 54
  const isTiny = height < 34

  return (
    <Tooltip title={tooltip} arrow>
      <Sheet
        variant="soft"
        sx={sx.root(top, height, typeMeta)}
        onClick={() => onClick?.(event)}
      >
        <Box sx={sx.inner}>
          <Box sx={sx.topRow}>
            <Box sx={sx.iconWrap}>
              {iconUi({ id: iconId, sx: { fontSize: 14 } })}
            </Box>

            <Typography level="title-sm" sx={sx.title(isTiny)} noWrap>
              {event?.title || typeMeta?.label || 'אירוע'}
            </Typography>
          </Box>

          {!isTiny && (
            <Typography level="body-xs" sx={sx.time}>
              {timeLabel}
            </Typography>
          )}

          {!isCompact && subtitle ? (
            <Typography level="body-xs" sx={sx.subtitle} noWrap>
              {subtitle}
            </Typography>
          ) : null}

          {!isCompact && metaLabel ? (
            <Box sx={sx.metaRow}>
              <Chip
                size="sm"
                variant="soft"
                color="neutral"
                startDecorator={iconUi({ id: iconId, sx: { fontSize: 12 } })}
                sx={sx.metaChip(typeMeta)}
              >
                {metaLabel}
              </Chip>
            </Box>
          ) : null}
        </Box>
      </Sheet>
    </Tooltip>
  )
}
