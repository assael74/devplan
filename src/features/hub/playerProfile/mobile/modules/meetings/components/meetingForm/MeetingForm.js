// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingForm.js

import React from 'react'
import { Box, Sheet } from '@mui/joy'

import DateInputField from '../../../../../../../../ui/fields/dateUi/DateInputField.js'
import HourInputField from '../../../../../../../../ui/fields/dateUi/HourInputField.js'
import MeetingTypeSelectField from '../../../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField.js'
import MeetingStatusSelectField from '../../../../../../../../ui/fields/selectUi/meetings/MeetingStatusField.js'
import VideoLinkField from '../../../../../../../../ui/fields/inputUi/videos/VideoLinkField.js'

import { formSx } from '../sx/form.sx.js'

export default function MeetingForm({ isEditing, draft, onDraft }) {
  return (
    <Sheet sx={formSx.panel} variant="outlined">
      <Box sx={formSx.grid}>
        <Box sx={{ minWidth: 0 }}>
          <DateInputField
            label="תאריך הפגישה"
            disabled={!isEditing}
            value={draft?.meetingDate}
            onChange={(val) => onDraft((d) => ({ ...d, meetingDate: val }))}
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
            onChange={(val) => onDraft((d) => ({ ...d, type: val || '' }))}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <MeetingStatusSelectField
            value={draft?.status?.current?.id || ''}
            disabled={!isEditing}
            onChange={(val) =>
              onDraft((d) => ({
                ...d,
                status: {
                  ...(d?.status || { current: { id: '', time: 0 }, history: [] }),
                  current: {
                    ...(d?.status?.current || { time: 0 }),
                    id: val || '',
                  },
                },
              }))
            }
            size="sm"
          />
        </Box>
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
