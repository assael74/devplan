// playerProfile/mobile/modules/meetings/components/MeetingsListPane.js

import React from 'react'
import { Box, Divider, List, Sheet, Typography } from '@mui/joy'

import MeetingsToolbar from './MeetingsToolbar.js'
import MeetingCard from './meetingCard/MeetingCard.js'

import { listSx as sx } from './sx/list.sx'

function EmptyState() {
  return (
    <Box sx={{ px: 1.25, py: 3, display: 'grid', placeItems: 'center' }}>
      <Typography level="body-sm" sx={{ opacity: 0.6 }}>
        אין פגישות להצגה
      </Typography>
    </Box>
  )
}

export default function MeetingsListPane({
  filteredCount,
  meetingsCount,
  meetings,
  selectedId,
  indicators,
  onSelectId,
  onOpenFilters,
  onClearFilter,
  onResetFilters,
  onQuickEdit,
  onAdd,
}) {
  const hasItems = Boolean(meetings?.length)

  return (
    <Sheet sx={sx.rightPane} variant="outlined">
      <MeetingsToolbar
        filteredCount={filteredCount}
        meetingsCount={meetingsCount}
        indicators={indicators}
        onOpenFilters={onOpenFilters}
        onClearFilter={onClearFilter}
        onResetFilters={onResetFilters}
        onAdd={onAdd}
      />

      <Divider />

      <Box sx={sx.listWrap} className="dpScrollThin">
        {!hasItems ? (
          <EmptyState />
        ) : (
          <List sx={{ py: 0.5, px: 0, '--ListItem-paddingX': '0px' }}>
            {meetings.map((meeting) => (
              <MeetingCard
                key={`meeting:${String(meeting.id)}`}
                meeting={meeting}
                active={String(meeting.id) === String(selectedId)}
                onSelect={(item) => onSelectId(item.id)}
                onQuickEdit={(meeting) => onSelectId(meeting.id)}
              />
            ))}
          </List>
        )}
      </Box>
    </Sheet>
  )
}
