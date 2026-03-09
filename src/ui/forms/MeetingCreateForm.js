// ui/forms/MeetingCreateForm.js
import React, { useEffect, useMemo } from 'react'
import { Box, Divider, FormControl, FormLabel, Input, Typography } from '@mui/joy'

import DateInputField from '../fields/dateUi/DateInputField'
import MonthYearPicker from '../fields/dateUi/MonthYearPicker'
import MeetingTypeSelectField from '../fields/selectUi/meetings/MeetingTypeSelectField'
import PlayerSelectField from '../fields/selectUi/players/PlayerSelectField'

const clean = (v) => String(v ?? '').trim()

export default function MeetingCreateForm({ draft, onDraft, onValidChange, context }) {
  const players =
    context?.playersList ||
    context?.players ||
    context?.teamPlayers ||
    context?.clubPlayers ||
    []

  const validity = useMemo(() => {
    const meetingDate = clean(draft?.meetingDate)
    const meetingFor = clean(draft?.meetingFor)
    const type = clean(draft?.type)

    const okDate = !!meetingDate
    const okFor = !!meetingFor
    const okType = !!type

    const isValid = okDate && okFor && okType

    return {
      isValid,
      okDate,
      okFor,
      okType,
    }
  }, [draft])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>

      <Box sx={{ display: 'grid', gap: 1.5, mb: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <PlayerSelectField
          label="שחקן"
          value={draft?.playerId || ''}
          size="sm"
          readOnly={true}
          options={players}
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

      <Divider />

      <Typography level="title-sm">פרטי פגישה</Typography>

      <Box sx={{ display: 'grid', alignItems: 'center', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 0fr 1fr' } }}>
        <DateInputField
          label="תאריך"
          value={draft?.meetingDate || ''}
          timeValue={draft?.meetingHour || ''}
          onChange={(v) => onDraft({ ...draft, meetingDate: v })}
          onTimeChange={(v) => onDraft({ ...draft, meetingHour: v })}
          error={!validity.okDate}
          required
          size="sm"
          context='meeting'
        />
        <Divider orientation="vertical" />
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
