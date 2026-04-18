// playerProfile/desktop/modules/meetings/components/form/MeetingForm.js

import React from 'react'
import { Box, Divider, Sheet } from '@mui/joy'

import DateInputField from '../../../../../../../../ui/fields/dateUi/DateInputField.js'
import HourInputField from '../../../../../../../../ui/fields/dateUi/HourInputField.js'
import MeetingTypeSelectField from '../../../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField.js'
import MeetingStatusSteps from '../../../../../../../../ui/fields/checkUi/meetings/MeetingStatusSelector.js'
import VideoLinkField from '../../../../../../../../ui/fields/inputUi/videos/VideoLinkField.js'

import { formSx as sx } from '../sx/form.sx'

export default function MeetingForm({ isEditing, draft, onDraft }) {
  return (
    <Sheet sx={sx.panel} variant="outlined">
      <Box sx={sx.grid}>
        <Box sx={{ minWidth: 0 }}>
          <DateInputField
            label="תאריך הפגישה"
            disabled={!isEditing}
            value={draft?.meetingDate}
            timeValue={draft?.meetingHour}
            onChange={(value) => onDraft((prev) => ({ ...prev, meetingDate: value }))}
            onTimeChange={(value) => onDraft((prev) => ({ ...prev, meetingHour: value }))}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <HourInputField
            label="שעת הפגישה"
            disabled={!isEditing}
            value={draft?.meetingHour}
            onChange={(val) => onDraft((d) => ({ ...d, meetingHour: val }))}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <MeetingTypeSelectField
            value={draft?.type || ''}
            disabled={!isEditing}
            onChange={(value) => onDraft((prev) => ({ ...prev, type: value }))}
            size="sm"
          />
        </Box>

        <Divider orientation="vertical" sx={{ mx: 1 }} />

        <MeetingStatusSteps
          value={{ id: draft?.status?.current?.id || '' }}
          disabled={!isEditing}
          onChange={(value) =>
            onDraft((prev) => ({
              ...prev,
              status: {
                ...(prev?.status || { current: { id: '', time: 0 }, history: [] }),
                current: { ...(prev?.status?.current || { time: 0 }), id: value?.id || '' },
              },
            }))
          }
          size="sm"
        />
      </Box>
      
      <Box sx={{ minWidth: 0, pt: 1 }}>
        <VideoLinkField
          label="קישור לוידאו"
          disabled={!isEditing}
          value={draft?.videoId || draft?.videoLink || ''}
          onChange={(val) => onDraft((d) => ({...d, videoId: val || '', videoLink: val || '' }))}
          size="sm"
        />
      </Box>
    </Sheet>
  )
}
