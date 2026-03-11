// ui/forms/ui/videoAnalysis/VideoAnalysisCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import VideoLinkField from '../../../fields/inputUi/videos/VideoLinkField'
import VideoNameField from '../../../fields/inputUi/videos/VideoNameField'
import YearPicker from '../../../fields/dateUi/YearPicker.js'
import MonthPicker from '../../../fields/dateUi/MonthPicker.js'
import MeetingSelectField from '../../../fields/selectUi/meetings/MeetingSelectField.js'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField.js'
import PlayerSelectField from '../../../fields/selectUi/players/PlayerSelectField.js'
import VideoObjectTypeSelectField from '../../../fields/selectUi/videos/videoAnalysis/VideoObjectTypeSelectField.js'
import VideoContextTypeSelectField from '../../../fields/selectUi/videos/videoAnalysis/VideoContextTypeSelectField.js'

import { vacfSx } from '../../sx/videoAnalysisCreateForm.sx.js'

export default function VideoAnalysisCreateFields({
  locks,
  draft,
  layout,
  onDraft,
  context,
  visible,
  validity,
  disabled,
  isEntityMode,
  onValidChange,
  isMeetingMode,
  objectTypeOptions,
  contextTypeOptions,
}) {
  const contextType = draft?.contextType || ''
  const objectType = draft?.objectType || ''
  const meetingId = draft?.meetingId || ''
  const teamId = draft?.teamId || ''
  const playerId = draft?.playerId || ''
  const year = draft?.year || ''
  const month = draft?.month || ''
  const name = draft?.name || ''
  const link = draft?.link || ''

  return (
    <Box sx={vacfSx.root(layout)}>

      <Box sx={vacfSx.block(layout.topCols, 1)}>
        <VideoNameField
          required
          value={name}
          onChange={(v) => onDraft({ ...draft, name: v })}
        />

        <VideoLinkField
          required
          value={link}
          onChange={(v) => onDraft({ ...draft, link: v })}
        />
      </Box>

      <Box sx={vacfSx.block(layout.mainCols, 1.5)}>
        <VideoContextTypeSelectField
          required
          value={contextType}
          disabled={!!locks.lockContextType}
          onChange={(v) => onDraft({ ...draft, contextType: v, objectType: '', meetingId: null, teamId: null, playerId: null })}
          options={contextTypeOptions}
        />

        <VideoObjectTypeSelectField
          required
          value={objectType}
          onChange={(v) => onDraft({ ...draft, objectType: v })}
          options={objectTypeOptions}
          disabled={disabled.disableObjectType}
          readOnly={isMeetingMode || !!locks.lockObjectType}
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={vacfSx.title}>
          פרטי הפגישה
        </Typography>
      </Divider>

      <Box sx={vacfSx.block(layout.metaCols)}>
        {visible.showMeetingField && (
          <MeetingSelectField
            value={meetingId || ''}
            onChange={(v) => onDraft({ ...draft, meetingId: v })}
            options={context?.meetings || []}
            context={context}
            disabled={disabled.disableMeeting}
            required={isMeetingMode}
          />
        )}

        {visible.showPlayerField && (
          <PlayerSelectField
            value={playerId || ''}
            onChange={(v) => onDraft({ ...draft, playerId: v })}
            context={context}
            options={context?.players}
            disabled={disabled.disablePlayer}
            required={isEntityMode && objectType === 'player'}
          />
        )}

        {visible.showTeamField && (
          <TeamSelectField
            value={teamId || ''}
            onChange={(v) => onDraft({ ...draft, teamId: v })}
            context={context}
            options={context?.teams}
            clubId={draft?.clubId || ''}
            disabled={disabled.disableTeam}
            required={isEntityMode && objectType === 'team'}
          />
        )}
      </Box>

      <Divider>
        <Typography level="title-sm" sx={vacfSx.title}>
          זמן הוידאו
        </Typography>
      </Divider>

      <Box sx={vacfSx.block(layout.timeCols, 1)}>
        <YearPicker value={year} onChange={(v) => onDraft({ ...draft, year: v })} />

        <MonthPicker value={month} onChange={(v) => onDraft({ ...draft, month: v })} />
      </Box>
    </Box>
  )
}
