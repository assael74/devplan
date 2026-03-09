// features/hub/playerProfile/modules/meetings/PlayerMeetingsModule.js
import React, { useCallback, useMemo } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import DriveVideoPlayer from '../../../../../ui/domains/video/DriveVideoPlayer.js'

import { sx } from './playerMeetingsModule.sx'
import useMeetingsWorkspace from './hooks/useMeetingsWorkspace'

import MeetingsListPane from './components/MeetingsListPane'
import MeetingDetailsPane from './components/MeetingDetailsPane' // <-- אחרי הפירוק

import { useUpdateAction } from '../../../../../ui/domains/entityActions/updateAction.js'

const link = 'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

export default function PlayerMeetingsModule({ entity, context }) {
  const player = entity
  const ws = useMeetingsWorkspace(player)

  const meetingDocId = ws.selected?.id || null

  const entityName = useMemo(
    () => ws.selected?.title || ws.selected?.typeLabel || 'מפגש',
    [ws.selected?.title, ws.selected?.typeLabel]
  )

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'meetings',
    snackEntityType: 'meeting',
    id: meetingDocId,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const onSaveMeeting = useCallback(
    async (_meetingId, patch) => {
      const fieldsPatch = {}
      if (patch?.meetingDate !== undefined) fieldsPatch.meetingDate = patch.meetingDate
      if (patch?.meetingHour !== undefined) fieldsPatch.meetingHour = patch.meetingHour
      if (patch?.type !== undefined) fieldsPatch.type = patch.type
      if (patch?.status !== undefined) fieldsPatch.status = patch.status
      if (patch?.notes !== undefined) fieldsPatch.notes = patch.notes
      if (patch?.tags !== undefined) fieldsPatch.tags = patch.tags

      return runUpdate(fieldsPatch, { section: 'playerProfile.meetings', meetingId: meetingDocId })
    },
    [runUpdate, meetingDocId]
  )

  return (
    <>
      <Box sx={sx.stage}>
        <Box sx={sx.root}>
          <Box sx={sx.paneWrapRight}>
            <MeetingsListPane
              sx={sx}
              filters={ws.filters}
              filteredCount={ws.filtered.length}
              flatRightList={ws.flatRightList}
              selectedId={ws.selectedId}
              onSelectId={ws.setSelectedId}
              onChangeQuery={(q) => ws.onChange({ query: q })}
              onAdd={ws.onAdd}
            />
          </Box>

          <Box sx={sx.paneWrapLeft}>
            <MeetingDetailsPane
              sx={sx}
              selected={ws.selected}
              onSave={onSaveMeeting}
              pending={pending}
              onOpenVideo={ws.onOpenVideo}
            />
          </Box>
        </Box>
      </Box>

      <DriveVideoPlayer
        open={ws.videoOpen}
        onClose={() => ws.setVideoOpen(false)}
        videoLink={link}
        videoName={ws.videoName}
        variant="analysis"
      />
    </>
  )
}
