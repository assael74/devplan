// playerProfile/mobile/modules/meetings/PlayerMeetingsModule.js

import React, { useCallback, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import MobileFiltersDrawerShell from '../../../../../../ui/patterns/filters/MobileFiltersDrawerShell.js'

import useMeetingsWorkspace from '../../../sharedLogic/meetings/module/useMeetingsWorkspace.js'
import { useMeetingHubUpdate } from '../../../../hooks/meetings/useMeetingHubUpdate.js'

import MeetingsListPane from './components/MeetingsListPane.js'
import MeetingsFilters from './components/MeetingsFilters.js'
import MeetingScreen from './components/meetingForm/MeetingScreen.js'

const FALLBACK_VIDEO_LINK = 'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

export default function PlayerMeetingsModule({ entity }) {
  const ws = useMeetingsWorkspace(entity)
  const [screen, setScreen] = useState('list')

  const { run, pending } = useMeetingHubUpdate(ws.selected)

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

  const handleSaveMeeting = useCallback(
    async (_meetingId, patch) => {
      if (!ws.selected?.id) return

      await run('updateMeeting', patch, {
        section: 'playerProfile.meetings',
        meetingId: ws.selected.id,
      })
    },
    [run, ws.selected]
  )

  return (
    <SectionPanelMobile bodySx={{ p: 0, pb: 0, minHeight: 0 }}>
      <Box
        sx={{
          minHeight: 'calc(100dvh - 96px)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {screen === 'list' ? (
          <MeetingsListPane
            filters={ws.filters}
            filteredCount={ws.filtered.length}
            meetingsCount={ws.meetings.length}
            meetings={ws.filtered}
            selectedId={ws.selectedId}
            indicators={ws.indicators}
            onSelectId={handleSelectMeeting}
            onOpenFilters={() => ws.setDrawerOpen(true)}
            onClearFilter={ws.onClearFilter}
            onResetFilters={ws.onReset}
            onAdd={ws.onAdd}
          />
        ) : (
          <MeetingScreen
            selected={ws.selected}
            pending={pending}
            onSave={handleSaveMeeting}
            onOpenVideo={ws.onOpenVideo}
            onBack={handleBackToList}
          />
        )}
      </Box>

      <MobileFiltersDrawerShell
        open={ws.drawerOpen}
        onClose={() => ws.setDrawerOpen(false)}
        title="סינון פגישות"
        onReset={ws.onReset}
        hasActiveFilters={ws.hasActiveFilters}
      >
        <MeetingsFilters
          filters={ws.filters}
          filterOptions={ws.filterOptions}
          onChange={ws.onChange}
        />
      </MobileFiltersDrawerShell>

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
