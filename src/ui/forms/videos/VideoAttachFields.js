// ui/forms/videos/VideoAttachFields.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import VideoContextTypeSelectField from '../../fields/videos/videoAnalysis/VideoContextTypeSelectField.js'
import VideoObjectTypeSelectField from '../../fields/videos/videoAnalysis/VideoObjectTypeSelectField.js'
import MeetingSelectField from '../../fields/meetings/MeetingSelectField.js'
import PlayerSelectField from '../../fields/players/PlayerSelectField.js'
import TeamSelectField from '../../fields/teams/TeamSelectField.js'
import VideoNameField from '../../fields/videos/VideoNameField.js'
import MonthPicker from '../../fields/core/MonthPicker.js'
import YearPicker from '../../fields/core/YearPicker.js'

import { videoFieldsSx } from './sx/videoFields.sx.js'

export default function VideoAttachFields({
  draft,
  onDraft,
  context,
  locks = {},
  disabled = {},
  isMeetingMode,
  isEntityMode,
  objectTypeOptions,
  contextTypeOptions,
}) {
  const updateDraft = (patch) => {
    if (typeof onDraft !== 'function') return

    onDraft((current) => ({
      ...current,
      ...patch,
    }))
  }

  return (
    <Box sx={videoFieldsSx.root}>
      <Box sx={videoFieldsSx.block}>
        <VideoNameField
          required
          value={draft?.name || ''}
          onChange={(value) => updateDraft({ name: value })}
          disabled={!!disabled.all}
        />
      </Box>

      <Box sx={videoFieldsSx.pair}>
        <YearPicker
          value={draft?.year || ''}
          onChange={(value) => updateDraft({ year: value })}
          disabled={!!disabled.all}
        />

        <MonthPicker
          value={draft?.month || ''}
          onChange={(value) => updateDraft({ month: value })}
          disabled={!!disabled.all}
        />
      </Box>

      <Divider sx={videoFieldsSx.divider}>
        <Typography level="body-xs" sx={videoFieldsSx.dividerText}>
          סוג השיוך
        </Typography>
      </Divider>

      <Box sx={videoFieldsSx.pair}>
        <VideoContextTypeSelectField
          required
          value={draft?.contextType || ''}
          disabled={!!locks.lockContextType || !!disabled.all}
          onChange={(value) => {
            updateDraft({
              contextType: value,
              objectType: '',
              meetingId: '',
              teamId: '',
              playerId: '',
            })
          }}
          options={contextTypeOptions}
        />

        <VideoObjectTypeSelectField
          required
          value={draft?.objectType || ''}
          onChange={(value) => {
            updateDraft({
              objectType: value,
              meetingId: '',
              teamId: '',
              playerId: '',
            })
          }}
          options={objectTypeOptions}
          disabled={!!disabled.disableObjectType || !!disabled.all}
          readOnly={isMeetingMode || !!locks.lockObjectType}
        />
      </Box>

      <Divider sx={videoFieldsSx.divider}>
        <Typography level="body-xs" sx={videoFieldsSx.dividerText}>
          שיוך הוידאו
        </Typography>
      </Divider>

      <Box sx={videoFieldsSx.block}>
        <MeetingSelectField
          value={draft?.meetingId || ''}
          onChange={(value) => updateDraft({ meetingId: value })}
          options={context?.meetings || []}
          context={context}
          disabled={!!disabled.disableMeeting || !!disabled.all}
          required={!!isMeetingMode}
        />

        <PlayerSelectField
          value={draft?.playerId || ''}
          onChange={(value) => updateDraft({ playerId: value })}
          context={context}
          options={context?.players || []}
          disabled={!!disabled.disablePlayer || !!disabled.all}
          required={isEntityMode && draft?.objectType === 'player'}
        />

        <TeamSelectField
          value={draft?.teamId || ''}
          onChange={(value) => updateDraft({ teamId: value })}
          context={context}
          options={context?.teams || []}
          clubId={draft?.clubId || ''}
          disabled={!!disabled.disableTeam || !!disabled.all}
          required={isEntityMode && draft?.objectType === 'team'}
        />
      </Box>
    </Box>
  )
}
