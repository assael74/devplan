// playerProfile/desktop/modules/meetings/PlayerMeetingsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import DriveVideoPlayer from '../../../../../../ui/domains/video/DriveVideoPlayer.js'
import { moduleSx as sx } from './playerMeetingsModule.sx'
import useMeetingsWorkspace from './../../../sharedLogic'

import MeetingsListPane from './components/list/MeetingsListPane'
import MeetingPane from './components/form/MeetingPane'

const link = 'https://drive.google.com/uc?id=1ZVjdelIdccdtifMfN4ZtwYlLIVnaFsGR'

export default function PlayerMeetingsModule({ entity }) {
  const player = entity
  const ws = useMeetingsWorkspace(player)

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
              onResetFilters={() =>
                ws.onChange({
                  query: '',
                  type: '',
                  status: '',
                  month: '',
                  showCanceled: false,
                })
              }
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
        videoLink={link}
        videoName={ws.videoName}
        variant="analysis"
      />
    </>
  )
}
