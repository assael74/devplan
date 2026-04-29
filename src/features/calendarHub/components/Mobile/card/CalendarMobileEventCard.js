// features/calendarHub/components/mobile/card/CalendarMobileEventCard.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import { CALENDAR_EVENT_TYPES } from '../../../logic/calendarHub.constants.js'

import {
  formatCalendarEventTime,
  buildCalendarEventSubtitle,
  buildCalendarEventMetaLabel,
  buildCalendarEventMetaPhoto,
  buildCalendarEventStatusMeta,
} from '../../../logic/calendarEventItem.helpers.js'

import { cardSx as sx } from './card.sx'

function getEventTypeMeta(event) {
  return CALENDAR_EVENT_TYPES[event?.type] || {
    id: event?.type || 'event',
    label: 'אירוע',
    idIcon: 'calendar',
    color: 'primary.softBg',
  }
}

export default function CalendarMobileEventCard({
  event,
  context,
  onClick,
}) {
  if (!event) return null

  const typeMeta = getEventTypeMeta(event)

  const timeLabel = formatCalendarEventTime(event?.startAt, event?.endAt)
  const subtitle = buildCalendarEventSubtitle(event)
  const metaLabel = buildCalendarEventMetaLabel(event)
  const metaPhoto = buildCalendarEventMetaPhoto(event, context)
  const statusMeta = buildCalendarEventStatusMeta(event)

  return (
    <Box onClick={() => onClick(event)} sx={sx.root(typeMeta)}>
      <Box sx={sx.avatarWrap}>
        <Avatar src={metaPhoto} sx={sx.avatar(typeMeta)}>
          {iconUi({id: typeMeta?.idIcon || 'calendar', size: 'sm' })}
        </Avatar>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={sx.titleRow}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              level="title-sm"
              noWrap
              sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
            >
              {event?.title || typeMeta?.label || 'אירוע'}
            </Typography>

            {subtitle ? (
              <Typography
                level="body-xs"
                noWrap
                sx={{ color: 'text.secondary', mt: 0.3, fontWeight: 600 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Chip
            size="sm"
            variant="soft"
            color={statusMeta?.color || 'neutral'}
            startDecorator={iconUi({id: statusMeta?.idIcon || 'calendar', sx: { fontSize: 13 } })}
            sx={sx.chip}
          >
            {statusMeta?.label || 'סטטוס'}
          </Chip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {metaLabel ? (
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Chip size="sm" variant="soft" color="neutral" sx={sx.chipLable}>
                {metaLabel}
              </Chip>
            </Box>
          ) : null}

          {timeLabel ? (
            <Typography
              level="body-xs"
              sx={{ color: 'text.primary', fontWeight: 800, mt: 0.75 }}
            >
              {timeLabel}
            </Typography>
          ) : null}          
        </Box>
      </Box>
    </Box>
  )
}
