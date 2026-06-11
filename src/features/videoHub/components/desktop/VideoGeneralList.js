// videoHub/components/desktop/general/VideoGeneralList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import VideoGeneralDesktopCard from '../../../../ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js'
import { videoTabSx as sx } from './tab.sx'

export default function VideoGeneralList({
  items = [],
  emptyTitle = 'אין פריטים',
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
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

  return (
    <Box sx={sx.gridWrap}>
      {items.map(video => (
        <VideoGeneralDesktopCard
          key={video?.id || video?.docId || video?.link}
          video={video}
          onWatch={onWatch}
          onEdit={onEdit}
          onShare={onShare}
          onDelete={onDelete}
          tagsById={tagsById}
          density="compact"
        />
      ))}
    </Box>
  )
}
