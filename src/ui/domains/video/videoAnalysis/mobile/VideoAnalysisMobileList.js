import React from 'react'
import { Box, Typography } from '@mui/joy'

import VideoAnalysisMobileCard from './videoCard/VideoAnalysisMobileCard.js'

export default function VideoAnalysisMobileList({
  rows = [],
  onWatch,
  onEdit,
  onLink,
  emptyTitle = 'לא נמצא וידאו להצגה',
  emptySubtitle = 'נסה לשנות פילטרים או לאפס את החיפוש.',
  sx,
}) {
  if (!rows.length) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 0.5,
          justifyItems: 'center',
          p: 2.5,
          borderRadius: 16,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.level1',
          ...sx,
        }}
      >
        <Typography level="title-sm">{emptyTitle}</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          {emptySubtitle}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 1, pt: 1, ...sx }}>
      {rows.map(video => (
        <VideoAnalysisMobileCard
          key={video.id}
          video={video}
          onWatch={onWatch}
          onEdit={onEdit}
          onLink={onLink}
        />
      ))}
    </Box>
  )
}
