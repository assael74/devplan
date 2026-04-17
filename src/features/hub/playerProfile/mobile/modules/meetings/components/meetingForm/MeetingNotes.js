// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingNotes.js

import React from 'react'
import { Box, Sheet, Textarea, Typography } from '@mui/joy'
import MeetingCommentsField from '../../../../../../../../ui/fields/inputUi/meetings/MeetingCommentsField.js'

import { formSx } from '../sx/form.sx.js'

export default function MeetingNotes({ isEditing, selected, draft, onDraft }) {
  return (
    <Sheet sx={formSx.panel} variant="outlined">
      <Box sx={formSx.panelTitleRow}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>הערות</Typography>
      </Box>

      <MeetingCommentsField
        disabled={!isEditing}
        value={draft?.notes || ''}
        onChange={(val) => onDraft((d) => ({ ...d, notes: val || '' }))}
        minRows={4}
        size="sm"
      />
    </Sheet>
  )
}
