// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js

import React from 'react'
import { Box, Card } from '@mui/joy'

import { videoGeneralDesktopCardSx as sx } from './sx/card.sx.js'
import VideoGeneralMedia from './VideoGeneralMedia.js'
import VideoGeneralHeader from './VideoGeneralHeader.js'
import VideoGeneralTagsBar from './VideoGeneralTagsBar.js'

export default function VideoGeneralDesktopCard({
  video,
  onWatch,
  onEdit,
  tagsById,
  showYm = false,
  entityType = 'video',
}) {
  return (
    <Card size="sm" variant="outlined" sx={sx.cardGrid}>
      <VideoGeneralMedia
        video={video}
        entityType={entityType}
        onWatch={onWatch}
      />

      <Box sx={sx.cardBody}>
        <VideoGeneralHeader
          video={video}
          showYm={showYm}
        />

        <VideoGeneralTagsBar
          video={video}
          tagsById={tagsById}
          iconId="videoGeneral"
        />
      </Box>

      <Box sx={sx.actionRail}>
        <Box
          role="button"
          tabIndex={0}
          aria-label="עריכת וידאו"
          onClick={() => onEdit(video)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onEdit(video)
            }
          }}
          sx={sx.editButton}
        >
          עריכה
        </Box>
      </Box>
    </Card>
  )
}
