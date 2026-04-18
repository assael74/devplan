// playerProfile/desktop/modules/meetings/components/list/MeetingsList.js

import React from 'react'
import { Box, List, Typography } from '@mui/joy'
import MeetingCard from './MeetingCard'

import { listSx as sx } from '../sx/list.sx'

export default function MeetingsList({ items, selectedId, onSelectId }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <Box sx={sx.listWrap} className="dpScrollThin">
      {safeItems.length === 0 ? (
        <Box sx={{ px: 1, py: 2 }}>
          <Typography level="body-sm" sx={{ opacity: 0.6 }}>
            אין פגישות להצגה
          </Typography>
        </Box>
      ) : (
        <List sx={{ py: 0.5, px: 0, '--ListItem-paddingX': '0px' }}>
          {safeItems.map((meeting) => (
            <MeetingCard
              key={`meeting:${String(meeting.id)}`}
              meeting={meeting}
              active={String(meeting.id) === String(selectedId)}
              onSelect={(value) => onSelectId(value.id)}
            />
          ))}
        </List>
      )}
    </Box>
  )
}
