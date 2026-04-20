// playerProfile/mobile/modules/meetings/PlayerMeetingsModule.js

import React, { useCallback, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import MobileFiltersDrawerShell from '../../../../../../ui/patterns/filters/MobileFiltersDrawerShell.js'

import useMeetingsWorkspace from '../../../sharedLogic/meetings/module/useMeetingsWorkspace.js'
import { useMeetingHubUpdate } from '../../../../hooks/meetings/useMeetingHubUpdate.js'

import MeetingsToolbar from './components/toolbar/MeetingsToolbar.js'
import MeetingsListPane from './components/MeetingsListPane.js'
import MeetingsFilters from './components/toolbar/MeetingsFilters.js'
import MeetingScreen from './components/meetingForm/MeetingScreen.js'

import { profileSx as sx } from './../../sx/profile.sx'

const FALLBACK_VIDEO_LINK = 'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

export default function PlayerMeetingsModule({ entity }) {
  const ws = useMeetingsWorkspace(entity)
  const [screen, setScreen] = useState('list')
  const [filtersOpen, setFiltersOpen] = useState(false)

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
    <SectionPanelMobile>
      {screen === 'list' ? (
        <Box sx={sx.moduleRoot}>
          <MeetingsToolbar
            filters={ws.filters}
            filterOptions={ws.filterOptions}
            filteredCount={ws.filtered.length}
            meetingsCount={ws.meetings.length}
            indicators={ws.indicators}
            onOpenFilters={() => setFiltersOpen(true)}
            onChangeFilters={ws.onChange}
            onClearFilter={ws.onClearFilter}
            onResetFilters={ws.onReset}
            onAdd={ws.onAdd}
          />
        </Box>
      ) : null}

      {screen === 'list' ? (
        <MeetingsListPane
          filters={ws.filters}
          filterOptions={ws.filterOptions}
          filteredCount={ws.filtered.length}
          meetingsCount={ws.meetings.length}
          meetings={ws.filtered}
          selectedId={ws.selectedId}
          indicators={ws.indicators}
          onSelectId={handleSelectMeeting}
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

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity="player"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לסינון פגישות"
        resultsText={`${ws.filtered.length} מתוך ${ws.meetings.length} פגישות`}
        onReset={ws.onReset}
        resetDisabled={!ws.hasActiveFilters}
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
