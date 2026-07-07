// playerProfile/desktop/modules/meetings/PlayerMeetingsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'

import { moduleSx as sx } from './playerMeetingsModule.sx'

import { usePlayerMeetingsModuleModel } from '../../../sharedModules/meetings'

const MeetingsListPane = React.lazy(() => import('./components/list/MeetingsListPane'))
const MeetingPane = React.lazy(() => import('./components/form/MeetingPane'))

export default function PlayerMeetingsModule({ entity }) {
  const {
    ws,
    fallbackVideoLink,
    handleResetFilters,
  } = usePlayerMeetingsModuleModel({ entity })

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 180px)', minHeight: 520, overflowY: 'hidden' }}>
        <Box sx={sx.root}>
          <Box sx={sx.paneWrapRight}>
            <MeetingsListPane
              filters={ws.filters}
              filterOptions={ws.filterOptions}
              filteredCount={ws.filtered.length}
              items={ws.flatRightList}
              selectedId={ws.selectedId}
              onSelectId={ws.setSelectedId}
              onChange={ws.onChange}
              onResetFilters={handleResetFilters}
            />
          </Box>

          <Box sx={sx.paneWrapLeft}>
            <MeetingPane
              selected={ws.selected}
              onOpenVideo={ws.onOpenVideo}
            />
          </Box>
        </Box>
      </Box>

      <DriveVideoPlayer
        open={ws.videoOpen}
        onClose={() => ws.setVideoOpen(false)}
        videoLink={ws.videoLink || fallbackVideoLink}
        videoName={ws.videoName}
        variant="analysis"
      />
    </>
  )
}
