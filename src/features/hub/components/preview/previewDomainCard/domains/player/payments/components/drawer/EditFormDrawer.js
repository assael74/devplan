// previewDomainCard/domains/player/payments/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../../shared/Payments/Payments.constants.js'

import DateInputField from '../../../../../../../../../../ui/fields/dateUi/DateInputField'
import HourInputField from '../../../../../../../../../../ui/fields/dateUi/HourInputField'
import MonthYearPicker from '../../../../../../../../../../ui/fields/dateUi/MonthYearPicker'
import MeetingTypeSelectField from '../../../../../../../../../../ui/fields/selectUi/Payments/MeetingTypeSelectField'
import PaymentstatusSelectField from '../../../../../../../../../../ui/fields/selectUi/Payments/PaymentstatusField.js'
import VideoSelectField from '../../../../../../../../../../ui/fields/selectUi/videos/VideoSelectField'
import PaymentsCommentsField from '../../../../../../../../../../ui/fields/inputUi/Payments/MeetingCommentsField.js'

import { drawerFormrSx as sx } from '../../sx/editFormDrawer.sx.js'

export default function EditFormDrawer({ draft, setDraft, context }) {
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

  const videoAnalysisOption = context.videoAnalysis.filter(v=>v.contextType === 'floating')

  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Typography sx={sx.sectionTitleSx}>פרטי הפגישה</Typography>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
            <MeetingTypeSelectField
              label="סוג פגישה"
              value={draft?.type || ''}
              options={MEETING_TYPES}
              onChange={onChange('type')}
            />

            <PaymentstatusSelectField
              label="סטטוס"
              value={draft?.statusId || ''}
              currentId={draft?.statusId || ''}
              options={MEETING_STATUSES}
              onChange={onChange('statusId')}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
            <MonthYearPicker
              label="חודש / שנה"
              value={draft?.meetingFor || ''}
              onChange={onChange('meetingFor')}
            />

            <VideoSelectField
              value={draft?.videoId || ''}
              options={videoAnalysisOption}
              onChange={onChange('videoId')}
            />
          </Box>

          <PaymentsCommentsField
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
