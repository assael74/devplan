// teamProfile/mobile/modules/videos/components/TeamVideoList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { VideoAnalysisMobileCard } from '../../../../../../../ui/domains/video/videoAnalysis/mobile/index.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function TeamVideosList({
  rows,
  onEditVideo,
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
      {rows.map((row) => (
        <VideoAnalysisMobileCard
          key={row.id}
          video={row}
          onWatch={onWatchVideo}
          onEdit={onEditVideo}
        />
      ))}
    </Box>
  )
}
