// teamProfile/desktop/modules/videos/components/TeamVideoList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamVideoRow from './TeamVideoRow.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function TeamVideosList({
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
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {rows.map((row) => (
        <TeamVideoRow
          key={row.id}
          video={row}
          onWatchVideo={onWatchVideo}
          onEdit={onEditVideo}
          onOpenNotes={onOpenNotes}
        />
      ))}
    </Box>
  )
}
