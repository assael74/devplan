// ui/forms/ui/meetings/MeetingCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import DateInputField from '../../../fields/dateUi/DateInputField'
import HourInputField from '../../../fields/dateUi/HourInputField'
import MonthYearPicker from '../../../fields/dateUi/MonthYearPicker'
import MeetingTypeSelectField from '../../../fields/selectUi/meetings/MeetingTypeSelectField'
import PlayerSelectField from '../../../fields/selectUi/players/PlayerSelectField'

import { createSx as sx } from './sx/create.sx.js'

export default function MeetingCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const playerId = draft?.playerId || ''
  const type = draft?.type || ''
  const meetingDate = draft?.meetingDate || ''
  const meetingHour = draft?.meetingHour || ''
  const meetingFor = draft?.meetingFor || ''

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1.5)}>
        <PlayerSelectField
          label="שחקן"
          value={draft?.playerId || ''}
          size="sm"
          disabled
          options={context.players || []}
          context={context}
        />

        <MeetingTypeSelectField
          value={draft?.type || ''}
          onChange={(v) => onDraft({ ...draft, type: v })}
          required
          error={!validity.okType}
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          פרטי הפגישה
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.mainCols)}>
        <DateInputField
          label="תאריך פגישה"
          value={draft?.meetingDate || ''}
          onChange={(v) => onDraft({ ...draft, meetingDate: v })}
          error={!validity.okDate}
          required
          size="sm"
        />

        <HourInputField
          label="שעת פגישה"
          value={draft?.meetingHour || ''}
          onChange={(v) => onDraft({ ...draft, meetingHour: v })}
          required
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={sx.title}>
          מידע נוסף
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.metaCols, 1)}>
        <MonthYearPicker
          label="חודש"
          value={draft?.meetingFor || ''}
          onChange={(v) => onDraft({ ...draft, meetingFor: v })}
          error={!validity.okFor}
          required
          size="sm"
        />
      </Box>
    </Box>
  )
}
