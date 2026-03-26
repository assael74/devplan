// src/features/videoHub/components/general/VideoGeneralList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import VideoCardGeneral from './VideoCardGeneral'
import { videoListSx as sx } from './sx/list.sx'

export default function VideoGeneralList({
  items = [],
  gridKey,
  emptyTitle = 'אין פריטים',
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
  showYm = false,
  entityType = 'video',
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
      {items.map((video) => (
        <VideoCardGeneral
          key={video?.id || video?.docId || video?.link}
          video={video}
          onWatch={onWatch}
          onEdit={onEdit}
          onShare={onShare}
          onDelete={onDelete}
          tagsById={tagsById}
          showYm={showYm}
          entityType={entityType}
        />
      ))}
    </Box>
  )
}
