import React from 'react'
import { Box, Divider, Sheet } from '@mui/joy'

import DateInputField from '../../../../../../../ui/fields/dateUi/DateInputField.js'
import MeetingTypeSelectField from '../../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField.js'
import MeetingStatusSteps from '../../../../../../../ui/fields/checkUi/meetings/MeetingStatusSelector.js'

export default function MeetingDetailsForm({ sx, isEditing, draft, onDraft }) {
  return (
    <Sheet sx={sx.panel} variant="outlined">
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 1,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 0fr 1fr' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 2 }}>
          <DateInputField
            context="meeting"
            readOnly={!isEditing}
            value={draft?.meetingDate}
            timeValue={draft?.meetingHour}
            onChange={(val) => onDraft((d) => ({ ...d, meetingDate: val }))}
            onTimeChange={(val) => onDraft((d) => ({ ...d, meetingHour: val }))}
            size="sm"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 2 }}>
          <MeetingTypeSelectField
            value={draft?.type || ''}
            readOnly={!isEditing}
            onChange={(val) => onDraft((d) => ({ ...d, type: val }))}
            size="sm"
          />
        </Box>

        <Divider orientation="vertical" sx={{ mx: 1 }} />

        <MeetingStatusSteps
          value={{ id: draft?.status?.current?.id || '' }}
          readOnly={!isEditing}
          onChange={(val) =>
            onDraft((d) => ({
              ...d,
              status: {
                ...(d?.status || { current: { id: '', time: 0 }, history: [] }),
                current: { ...(d?.status?.current || { time: 0 }), id: val?.id || '' },
              },
            }))
          }
          size="sm"
        />
      </Box>
    </Sheet>
  )
}
