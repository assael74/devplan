// playerProfile/desktop/modules/meetings/components/form/MeetingNotes.js

import React from 'react'
import { Box, Sheet, Textarea, Typography } from '@mui/joy'

import { formSx as sx } from '../sx/form.sx'

export default function MeetingNotes({ isEditing, selected, draft, onDraft }) {
  return (
    <Sheet sx={sx.panel} variant="outlined">
      <Box sx={sx.panelTitleRow}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>הערות</Typography>
      </Box>

      {!isEditing ? (
        selected?.notes ? (
          <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
            {selected.notes}
          </Typography>
        ) : (
          <Typography level="body-sm" sx={{ opacity: 0.7 }}>
            אין הערות למפגש.
          </Typography>
        )
      ) : (
        <Textarea
          minRows={3}
          value={draft?.notes || ''}
          onChange={(event) => onDraft((prev) => ({ ...prev, notes: event.target.value }))}
        />
      )}
    </Sheet>
  )
}
