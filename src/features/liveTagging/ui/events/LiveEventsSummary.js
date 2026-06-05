// src/features/liveTagging/sharedUi/events/LiveEventsSummary.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { eventsSummarySx as sx } from './sx/eventsSummary.sx.js'

const getSideLabel = side => {
  if (side === 'positive') return 'הצלחה'
  if (side === 'negative') return 'כישלון'
  return 'פעולה'
}

const getSideColor = side => {
  if (side === 'positive') return 'success'
  if (side === 'negative') return 'danger'
  return 'neutral'
}

export function LiveEventsSummary({ events = [], onDeleteLast }) {
  const hasEvents = events.length > 0
  const lastEvent = hasEvents ? events[0] : null
  const side = lastEvent?.side || 'neutral'

  return (
    <Box sx={sx.root}>
      {lastEvent ? (
        <Box sx={sx.lastEventCard(side)}>
          <Box sx={sx.lastEventMain}>
            <Typography level="body-xs" sx={sx.mutedText}>
              בחירה אחרונה
            </Typography>

            <Typography level="title-sm" sx={sx.lastEventTitle}>
              {lastEvent.action}
            </Typography>

            <Typography level="body-xs" sx={sx.lastEventSub}>
              {lastEvent.zone} · {lastEvent.time}
            </Typography>
          </Box>

          <Chip
            size="sm"
            variant="soft"
            color={getSideColor(side)}
            sx={sx.sideChip}
          >
            {getSideLabel(side)}
          </Chip>
        </Box>
      ) : (
        <Box sx={sx.emptyLastEvent}>
          <Typography level="body-xs" sx={sx.mutedText}>
            בחירה אחרונה
          </Typography>

          <Typography level="body-sm" sx={sx.emptyText}>
            עדיין לא תויגו פעולות
          </Typography>
        </Box>
      )}

      <Box sx={sx.summaryRow}>
        <Box sx={sx.info}>
          <Typography level="body-xs" sx={sx.mutedText}>
            סיכום
          </Typography>

          <Typography level="title-sm" sx={sx.title}>
            {events.length} פעולות
          </Typography>
        </Box>

        <Button
          size="sm"
          variant="soft"
          color="danger"
          disabled={!hasEvents}
          onClick={onDeleteLast}
          sx={sx.deleteButton}
        >
          מחק אחרון
        </Button>
      </Box>
    </Box>
  )
}
