// playerProfile/mobile/modules/videos/components/PlayerVideoList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import PlayerVideoCard from './PlayerVideoCard.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function PlayerVideosList({
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
    <Box sx={sx.listWrap}>
      {rows.map((row) => (
        <PlayerVideoCard
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
