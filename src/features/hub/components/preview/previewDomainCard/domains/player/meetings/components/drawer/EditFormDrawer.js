// previewDomainCard/domains/player/meetings/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../../shared/meetings/meetings.constants.js'

import DateInputField from '../../../../../../../../../../ui/fields/dateUi/DateInputField'
import HourInputField from '../../../../../../../../../../ui/fields/dateUi/HourInputField'
import MonthYearPicker from '../../../../../../../../../../ui/fields/dateUi/MonthYearPicker'
import MeetingTypeSelectField from '../../../../../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField'
import MeetingStatusSelectField from '../../../../../../../../../../ui/fields/checkUi/meetings/MeetingStatusSelector.js'
import VideoLinkField from '../../../../../../../../../../ui/fields/inputUi/videos/VideoLinkField'
import MeetingsCommentsField from '../../../../../../../../../../ui/fields/inputUi/meetings/MeetingCommentsField.js'

import { drawerFormrSx as sx } from '../../sx/editFormDrawer.sx.js'

export default function EditFormDrawer({ draft, setDraft }) {
  const onChange = (key) => (value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const onInputChange = (key) => (event) => {
    setDraft((prev) => ({
      ...prev,
      [key]: event?.target?.value ?? '',
    }))
  }

  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Typography sx={sx.sectionTitleSx}>פרטי הפגישה</Typography>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr .5fr', gap: 0.85 }}>
            <DateInputField
              label="תאריך"
              value={draft?.meetingDate || ''}
              onChange={onChange('meetingDate')}
            />

            <HourInputField
              label="שעה"
              value={draft?.meetingHour || ''}
              onChange={onChange('meetingHour')}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
            <MeetingTypeSelectField
              label="סוג פגישה"
              value={draft?.type || ''}
              options={MEETING_TYPES}
              onChange={onChange('type')}
            />

            <MeetingStatusSelectField
              label="סטטוס"
              value={draft?.status || ''}
              options={MEETING_STATUSES}
              onChange={onChange('status')}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
            <MonthYearPicker
              label="חודש / שנה"
              value={draft?.meetingFor || ''}
              onChange={onChange('meetingFor')}
            />

            <VideoLinkField
              label="קישור לוידאו"
              value={draft?.videoLink || ''}
              onChange={onInputChange('videoLink')}
            />
          </Box>

          <MeetingsCommentsField
            label="הערות"
            value={draft?.notes || ''}
            onChange={onInputChange('notes')}
            minRows={5}
          />
        </Box>
      </Box>
    </Box>
  )
}
