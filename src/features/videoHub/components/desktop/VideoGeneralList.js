// videoHub/components/desktop/general/VideoGeneralList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import VideoGeneralDesktopCard from '../../../../ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js'
import VideoGeneralDesktopMiniCard from '../../../../ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopMiniCard.js'
import { videoTabSx as sx } from './tab.sx'

const getVideoId = video => {
  return video?.id || video?.videoId || video?.docId || ''
}

export default function VideoGeneralList({
  items = [],
  emptyTitle = 'אין פריטים',
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
  cardView = 'full',

  selectionMode = false,
  selectedVideoIds = [],
  onToggleSelect,
}) {
  if (!items.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography level="h4">
          {emptyTitle}
        </Typography>
      </Box>
    )
  }

  const selectedIds = new Set(selectedVideoIds)

  return (
    <Box sx={sx.gridWrap({ cardView })}>
      {items.map(video => {
        const videoId = getVideoId(video)

        const CardComponent = cardView === 'mini'
          ? VideoGeneralDesktopMiniCard
          : VideoGeneralDesktopCard

        return (
          <CardComponent
            key={videoId || video?.link}
            video={video}
            onWatch={onWatch}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
            tagsById={tagsById}
            density="compact"

            selectionMode={selectionMode}
            selected={selectedIds.has(videoId)}
            onToggleSelect={() => onToggleSelect?.(videoId)}
          />
        )
      })}
    </Box>
  )
}
