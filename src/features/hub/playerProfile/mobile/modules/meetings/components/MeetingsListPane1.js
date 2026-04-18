// playerProfile/mobile/modules/meetings/components/MeetingsListPane.js

import React from 'react'
import { Box, Divider, List, Sheet, Typography } from '@mui/joy'

import MeetingsToolbar from './toolbar/MeetingsToolbar.js'
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
  filters,
  filterOptions,
  selectedId,
  indicators,
  onSelectId,
  onOpenFilters,
  onChangeFilters,
  onClearFilter,
  onResetFilters,
  onAdd,
}) {
  const hasItems = Boolean(meetings?.length)

  return (
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
              onQuickEdit={(item) => onSelectId(item.id)}
            />
          ))}
        </List>
      )}
    </Box>
  )
}
