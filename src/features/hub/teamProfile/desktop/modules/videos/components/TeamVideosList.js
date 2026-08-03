import React from 'react'
import { Box, Typography } from '@mui/joy'
import { VideoAnalysisCard } from '../../../../../../../ui/domains/video/videoAnalysis/desktop/index.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function TeamVideosList({
  rows,
  onLinkVideo,
  onEditVideo,
  onWatchVideo,
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
    <Box sx={{
      display: 'grid',
      gap: 1.25,
      width: '100%',
      pt: 1,
      alignContent: 'start',
      gridTemplateColumns: 'repeat(auto-fill, minmax(214px, 214px))',
    }}>
      {rows.map(row => (
        <VideoAnalysisCard
          key={row?.id || row?.videoId || row?.docId || row?.link}
          video={row}
          preset="profile"
          from="profile"
          onWatch={onWatchVideo}
          onEdit={onEditVideo}
          onLink={onLinkVideo}
        />
      ))}
    </Box>
  )
}
