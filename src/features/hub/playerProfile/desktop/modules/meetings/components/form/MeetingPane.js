// playerProfile/desktop/modules/meetings/components/form/MeetingPane.js

import React from 'react'
import { Box, Divider, Sheet, Typography } from '@mui/joy'

import { formSx as sx } from '../sx/form.sx'

import MeetingHeader from './MeetingHeader'
import MeetingForm from './MeetingForm'
import MeetingNotes from './MeetingNotes'
import MeetingVideo from './MeetingVideo'
import useMeetingForm from './useMeetingForm'

export default function MeetingPane({ selected, onOpenVideo }) {
  const form = useMeetingForm(selected)

  if (!selected) {
    return (
      <Sheet sx={sx.leftPane} variant="outlined">
        <Box sx={sx.emptyLeft}>
          <Typography level="body-sm" sx={{ opacity: 0.8 }}>
            בחר מפגש מהרשימה כדי לראות פירוט.
          </Typography>
        </Box>
      </Sheet>
    )
  }

  return (
    <Sheet sx={sx.leftPane} variant="outlined">
      <MeetingHeader
        selected={selected}
        isEditing={form.isEditing}
        pending={form.pending}
        isDirty={form.isDirty}
        canSave={form.canSave}
        onStartEdit={form.startEdit}
        onCancel={form.cancelEdit}
        onReset={form.resetEdit}
        onSave={form.save}
      />

      <Divider />

      <Box sx={sx.leftScroll} className="dpScrollThin">
        <MeetingForm
          isEditing={form.isEditing}
          draft={form.draft}
          onDraft={form.setDraft}
        />

        <MeetingNotes
          isEditing={form.isEditing}
          selected={selected}
          draft={form.draft}
          onDraft={form.setDraft}
        />

        <MeetingVideo
          selected={form.draft || selected}
          onOpenVideo={onOpenVideo}
        />
      </Box>
    </Sheet>
  )
}
