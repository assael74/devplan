import React from 'react'
import { Box, Sheet, Textarea, Typography } from '@mui/joy'

export default function MeetingNotesPanel({ sx, isEditing, selected, draft, onDraft }) {
  return (
    <Sheet sx={sx.panel} variant="outlined">
      <Box sx={sx.panelTitleRow}>
        <Typography level="title-sm" sx={sx.panelTitle}>הערות</Typography>
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
          onChange={(e) => onDraft((d) => ({ ...d, notes: e.target.value }))}
        />
      )}
    </Sheet>
  )
}
