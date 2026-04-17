// playerProfile/mobile/modules/meetings/PlayerMeetingsModule.js

import React, { useCallback, useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'

import { moduleSx as sx } from './meetingsModule.sx'
import useMeetingsWorkspace from './../../../sharedLogic'

import MeetingsListPane from './components/MeetingsListPane'
import MeetingDetailsMobileScreen from './components/MeetingDetailsMobileScreen'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const FALLBACK_VIDEO_LINK = 'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

export default function PlayerMeetingsModule({ entity, context }) {
  const player = entity
  const ws = useMeetingsWorkspace(player)

  const [screen, setScreen] = useState('list')

  const meetingDocId = ws.selected?.id || null

  const entityName = useMemo(() => {
    return ws.selected?.title || ws.selected?.typeLabel || 'מפגש'
  }, [ws.selected?.title, ws.selected?.typeLabel])

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
      if (patch?.videoId !== undefined) fieldsPatch.videoId = patch.videoId
      if (patch?.videoLink !== undefined) fieldsPatch.videoLink = patch.videoLink

      return runUpdate(fieldsPatch, {
        section: 'playerProfile.meetings',
        meetingId: meetingDocId,
      })
    },
    [runUpdate, meetingDocId]
  )

  const handleSelectMeeting = useCallback(
    (id) => {
      ws.setSelectedId(id)
      setScreen('details')
    },
    [ws]
  )

  const handleBackToList = useCallback(() => {
    setScreen('list')
  }, [])

  return (
    <SectionPanelMobile bodySx={sx.sectionBody}>
      <Box sx={sx.mobileRoot}>
        {screen === 'list' ? (
          <MeetingsListPane
            sx={sx}
            filters={ws.filters}
            filteredCount={ws.filtered.length}
            flatRightList={ws.flatRightList}
            selectedId={ws.selectedId}
            onSelectId={handleSelectMeeting}
            onChangeQuery={(q) => ws.onChange({ query: q })}
            onAdd={ws.onAdd}
          />
        ) : (
          <MeetingDetailsMobileScreen
            sx={sx}
            selected={ws.selected}
            pending={pending}
            onBack={handleBackToList}
            onSave={onSaveMeeting}
            onOpenVideo={ws.onOpenVideo}
          />
        )}
      </Box>

      <DriveVideoPlayer
        open={ws.videoOpen}
        onClose={() => ws.setVideoOpen(false)}
        videoLink={ws.videoLink || FALLBACK_VIDEO_LINK}
        videoName={ws.videoName}
        variant="analysis"
      />
    </SectionPanelMobile>
  )
}
