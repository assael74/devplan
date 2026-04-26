// src/features/videoHub/sharedUi/editDrawer/VideoAttachDrawerBody.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import VideoContextTypeSelectField from '../../../../ui/fields/selectUi/videos/videoAnalysis/VideoContextTypeSelectField.js'
import VideoObjectTypeSelectField from '../../../../ui/fields/selectUi/videos/videoAnalysis/VideoObjectTypeSelectField.js'
import TeamSelectField from '../../../../ui/fields/selectUi/teams/TeamSelectField.js'
import PlayerSelectField from '../../../../ui/fields/selectUi/players/PlayerSelectField.js'
import MeetingSelectField from '../../../../ui/fields/selectUi/meetings/MeetingSelectField.js'
import YearPicker from '../../../../ui/fields/dateUi/YearPicker.js'
import MonthPicker from '../../../../ui/fields/dateUi/MonthPicker.js'

export default function VideoAttachDrawerBody({
  draft,
  setDraft,
  context,
  locks = {},
  disabled = {},
  isMeetingMode,
  isEntityMode,
  objectTypeOptions,
  contextTypeOptions,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <VideoContextTypeSelectField
          required
          value={draft?.contextType || ''}
          disabled={!!locks.lockContextType}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              contextType: value,
              objectType: '',
              meetingId: '',
              teamId: '',
              playerId: '',
            }))
          }
          options={contextTypeOptions}
        />

        <VideoObjectTypeSelectField
          required
          value={draft?.objectType || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              objectType: value,
              meetingId: '',
              teamId: '',
              playerId: '',
            }))
          }
          options={objectTypeOptions}
          disabled={!!disabled.disableObjectType}
          readOnly={isMeetingMode || !!locks.lockObjectType}
        />
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          שיוך הוידאו
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        <MeetingSelectField
          value={draft?.meetingId || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              meetingId: value,
            }))
          }
          options={context?.meetings || []}
          context={context}
          disabled={!!disabled.disableMeeting}
          required={!!isMeetingMode}
        />

        <PlayerSelectField
          value={draft?.playerId || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              playerId: value,
            }))
          }
          context={context}
          options={context?.players || []}
          disabled={!!disabled.disablePlayer}
          required={isEntityMode && draft?.objectType === 'player'}
        />

        <TeamSelectField
          value={draft?.teamId || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              teamId: value,
            }))
          }
          context={context}
          options={context?.teams || []}
          clubId={draft?.clubId || ''}
          disabled={!!disabled.disableTeam}
          required={isEntityMode && draft?.objectType === 'team'}
        />
      </Box>

      <Divider sx={{ my: 1.25 }}>
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          שיוך זמנים
        </Typography>
      </Divider>

      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        }}
      >
        <YearPicker
          value={draft?.year || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              year: value,
            }))
          }
        />

        <MonthPicker
          value={draft?.month || ''}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              month: value,
            }))
          }
        />
      </Box>
    </Box>
  )
}
