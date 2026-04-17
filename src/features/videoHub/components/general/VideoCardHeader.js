// src/features/videoHub/components/VideoCardHeader.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'
import { videoHeaderSx as sx } from './sx/header.sx'

export default function VideoCardHeader({ video, showYm = false }) {
  const title = video?.title || video?.name || 'וידאו'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={sx.cardTopRow}>
        <Typography level="title-sm" noWrap sx={sx.cardTitle}>
          {title}
        </Typography>
      </Box>

      <Divider />
    </Box>
  )
}
