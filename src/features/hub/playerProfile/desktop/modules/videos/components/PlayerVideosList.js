// playerProfile/modules/videos/components/PlayerVideoList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { VideoAnalysisRow } from '../../../../../../../ui/domains/video/videoAnalysis/desktop/index.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function PlayerVideosList({
  rows,
  onEditVideo,
  onOpenEdit,
  onWatchVideo,
  onOpenNotes,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצא וידאו להצגה</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, pt: 1 }}>
      {rows.map((row) => (
        <VideoAnalysisRow
          key={row.id}
          video={row}
          onWatch={onWatchVideo}
          onEdit={onEditVideo}
        />
      ))}
    </Box>
  )
}
