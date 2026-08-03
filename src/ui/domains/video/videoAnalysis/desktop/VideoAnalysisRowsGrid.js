import React from 'react'
import { Box, Typography } from '@mui/joy'

import VideoAnalysisRow from './videoRow/VideoAnalysisRow.js'

export default function VideoAnalysisRowsGrid({
  rows = [],
  onWatch,
  onEdit,
  emptyTitle = 'לא נמצא וידאו להצגה',
  emptySubtitle = 'נסה לשנות פילטרים או לאפס את החיפוש.',
  columns = 2,
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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 1,
        pt: 1,
        ...sx,
      }}
    >
      {rows.map(video => (
        <VideoAnalysisRow
          key={video.id}
          video={video}
          onWatch={onWatch}
          onEdit={onEdit}
        />
      ))}
    </Box>
  )
}
