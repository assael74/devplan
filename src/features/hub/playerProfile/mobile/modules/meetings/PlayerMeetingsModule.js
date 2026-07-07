// playerProfile/mobile/modules/meetings/PlayerMeetingsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import MobileFiltersDrawerShell from '../../../../../../ui/patterns/filters/MobileFiltersDrawerShell.js'

import { usePlayerMeetingsModuleModel } from '../../../sharedModules/meetings'

import { profileSx as sx } from './../../sx/profile.sx'

const MeetingsToolbar = React.lazy(() => import('./components/toolbar/MeetingsToolbar.js'))
const MeetingsListPane = React.lazy(() => import('./components/MeetingsListPane.js'))
const MeetingsFilters = React.lazy(() => import('./components/toolbar/MeetingsFilters.js'))
const MeetingScreen = React.lazy(() => import('./components/meetingForm/MeetingScreen.js'))

export default function PlayerMeetingsModule({ entity }) {
  const {
    ws,
    screen,
    filtersOpen,
    pending,
    fallbackVideoLink,

    setFiltersOpen,

    handleResetFilters,
    handleSelectMeeting,
    handleBackToList,
    handleSaveMeeting,
  } = usePlayerMeetingsModuleModel({ entity })

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
            onResetFilters={handleResetFilters}
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
        onReset={handleResetFilters}
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
        videoLink={ws.videoLink || fallbackVideoLink}
        videoName={ws.videoName}
        variant="analysis"
      />
    </SectionPanelMobile>
  )
}
