// src/features/liveTagging/ui/events/LiveEventsList.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { eventSx as sx } from './sx/event.sx.js'

const getSideColor = (side) => {
  if (side === 'positive') return 'success'
  if (side === 'negative') return 'danger'
  return 'neutral'
}

export function LiveEventsList({ events = [], onDeleteLast }) {
  const hasEvents = events.length > 0

  return (
    <Box sx={sx.eventsPanel}>
      <Box sx={sx.eventsHeader}>
        <Box>
          <Typography level="body-xs" sx={sx.mutedText}>
            אירועים אחרונים
          </Typography>

          <Typography level="title-sm">
            {events.length} פעולות
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="soft"
          color="danger"
          disabled={!hasEvents}
          onClick={onDeleteLast}
        >
          מחק אחרון
        </Button>
      </Box>

      {!hasEvents && (
        <Box sx={sx.emptyEvents}>
          <Typography level="body-sm" sx={sx.mutedText}>
            עדיין לא תויגו פעולות
          </Typography>
        </Box>
      )}

      {hasEvents && (
        <Box sx={sx.eventsList}>
          {events.map((event) => (
            <Box key={event.id} sx={sx.eventRow}>
              <Box sx={sx.eventMain}>
                <Typography level="body-sm" sx={sx.eventAction}>
                  {event.action}
                </Typography>

                <Typography level="body-xs" sx={sx.mutedText}>
                  {event.subject} · {event.zone}
                </Typography>
              </Box>

              <Box sx={sx.eventMeta}>
                <Chip
                  size="sm"
                  variant="soft"
                  color={getSideColor(event.side)}
                >
                  {event.side === 'positive' ? '+' : '-'}
                </Chip>

                <Typography level="body-xs" sx={sx.eventTime}>
                  {event.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
