// src/features/videoHub/components/VideoCardHeader.js

import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { videoHeaderSx as sx } from './sx/header.sx'

export default function VideoCardHeader({ video, showYm = false }) {
  const title = video?.title || video?.name || 'וידאו'

  return (
    <Box sx={sx.cardTopRow}>
      <Typography level="title-sm" noWrap sx={sx.cardTitle}>
        {title}
      </Typography>

      {showYm ? (
        <Box sx={sx.cardYm}>
          <Chip size="sm" color="warning" variant="solid">
            {video?.year}
          </Chip>
          <Chip size="sm" color="warning" variant="solid">
            {video?.month}
          </Chip>
        </Box>
      ) : null}
    </Box>
  )
}
