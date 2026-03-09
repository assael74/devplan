// MeetingFormGrid.js
import React from 'react'
import { Box } from '@mui/joy'
import { gridBoxSx } from './MeetingEditDrawer.sx.js'

import DateInputField from '../../../../../../ui/fields/dateUi/DateInputField.js'
import MeetingTypeSelector from '../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField.js'
import VideoLinkField from '../../../../../../ui/fields/inputUi/videos/VideoLinkField.js'
import PlayerSelectField from '../../../../../../ui/fields/selectUi/players/PlayerSelectField.js'

export default function MeetingFormGrid({ draft, setDraft, context }) {
  return (
    <Box {...gridBoxSx}>
      {/* --- תאריך + שעה --- */}
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / span 1' }, minWidth: 0 }}>
        <DateInputField
          context="meeting"
          value={draft?.meetingDate || ''}
          onChange={(v) => setDraft((p) => ({ ...p, meetingDate: v || '' }))}
          timeValue={draft?.meetingHour || ''}
          onTimeChange={(v) => setDraft((p) => ({ ...p, meetingHour: v || '' }))}
          label="תאריך פגישה"
          required
          size="sm"
        />
      </Box>

      {/* --- סוג --- */}
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '2 / span 1' }, minWidth: 0 }}>
        <MeetingTypeSelector
          value={draft?.type || 'personal'}
          onChange={(v) => setDraft((p) => ({ ...p, type: v || 'personal' }))}
          required
          size="sm"
        />
      </Box>

      {/* --- שחקן --- */}
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '3 / span 1' }, minWidth: 0 }}>
        <PlayerSelectField
          value={draft?.playerId || ''}
          onChange={(v) => setDraft((p) => ({ ...p, playerId: v || '' }))}
          options={context.playersList}
          context={context}
          required
          size="sm"
          readOnly={false}
          multiple={false}
        />
      </Box>

      {/* --- וידאו --- */}
      <Box sx={{ gridColumn: { xs: '1 / -1', md: '4 / span 1' }, minWidth: 0 }}>
        <VideoLinkField
          value={draft?.videoLink || ''}
          onChange={(v) => setDraft((p) => ({ ...p, videoLink: v || '' }))}
          size="sm"
        />
      </Box>
    </Box>
  )
}
