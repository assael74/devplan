// playerProfile/mobile/modules/meetings/components/MeetingsListPane.js

import React from 'react'
import { Box, Divider, List, Sheet, Typography } from '@mui/joy'

import MeetingsToolbar from './toolbar/MeetingsToolbar.js'
import MeetingCard from './meetingCard/MeetingCard.js'

import { listSx as sx } from './sx/list.sx'

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

  if (!hasItems) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו פגישות</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {meetings.map((meeting) => (
        <MeetingCard
          key={`meeting:${String(meeting.id)}`}
          meeting={meeting}
          active={String(meeting.id) === String(selectedId)}
          onSelect={(item) => onSelectId(item.id)}
          onQuickEdit={(item) => onSelectId(item.id)}
        />
      ))}
    </Box>
  )
}
