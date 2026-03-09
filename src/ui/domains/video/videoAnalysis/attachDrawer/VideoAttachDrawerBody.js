// videoHub/components/analysis/attachDrawer/VideoAttachDrawerBody.js
import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import VideoContextTypeSelectField from '../../../../../ui/fields/selectUi/videos/videoAnalysis/VideoContextTypeSelectField.js'
import VideoObjectTypeSelectField from '../../../../../ui/fields/selectUi/videos/videoAnalysis/VideoObjectTypeSelectField.js'
import TeamSelectField from '../../../../../ui/fields/selectUi/teams/TeamSelectField.js'
import PlayerSelectField from '../../../../../ui/fields/selectUi/players/PlayerSelectField.js'
import MeetingSelectField from '../../../../../ui/fields/selectUi/meetings/MeetingSelectField.js'
import YearPicker from '../../../../../ui/fields/dateUi/YearPicker.js'
import MonthPicker from '../../../../../ui/fields/dateUi/MonthPicker.js'

import { videoAttachDrawerSx as sx } from './videoAttachDrawer.sx'

export default function VideoAttachDrawerBody({
  draft,
  setDraft,
  context,
  locks,
  disabled,
  isMeetingMode,
  isEntityMode,
  objectTypeOptions,
  contextTypeOptions,
}) {
  return (
    <Box sx={sx.body}>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <VideoContextTypeSelectField
          required
          value={draft.contextType}
          disabled={!!locks.lockContextType}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              contextType: v,
              objectType: '',
              meetingId: null,
              teamId: null,
              playerId: null,
            }))
          }
          options={contextTypeOptions}
        />

        <VideoObjectTypeSelectField
          required
          value={draft.objectType}
          onChange={(v) => setDraft((d) => ({ ...d, objectType: v }))}
          options={objectTypeOptions}
          disabled={disabled.disableObjectType}
          readOnly={isMeetingMode || !!locks.lockObjectType}
        />
      </Box>

      <Divider sx={{ my: 1 }}><Typography level="body-xs" sx={{ opacity: 0.75 }}>שיוך הוידאו</Typography></Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <MeetingSelectField
          value={draft.meetingId || ''}
          onChange={(v) => setDraft((d) => ({ ...d, meetingId: v }))}
          options={context?.meetings || []}
          context={context}
          disabled={disabled.disableMeeting}
          required={isMeetingMode}
        />

        <PlayerSelectField
          value={draft.playerId || ''}
          onChange={(v) => setDraft((d) => ({ ...d, playerId: v }))}
          context={context}
          options={context?.players}
          disabled={disabled.disablePlayer}
          required={isEntityMode && draft.objectType === 'player'}
        />

        <TeamSelectField
          value={draft.teamId || ''}
          onChange={(v) => setDraft((d) => ({ ...d, teamId: v }))}
          context={context}
          options={context?.teams}
          clubId={draft?.clubId || ''}
          disabled={disabled.disableTeam}
          required={isEntityMode && draft.objectType === 'team'}
        />
      </Box>

      <Divider sx={{ my: 2 }}><Typography level="body-xs" sx={{ opacity: 0.75 }}>שיוך זמנים</Typography></Divider>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <YearPicker value={draft.year} onChange={(v) => setDraft({ ...draft, year: v })} />
        <MonthPicker value={draft.month} onChange={(v) => setDraft({ ...draft, month: v })} />
      </Box>
    </Box>
  )
}
