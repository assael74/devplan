// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralHeader.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import { videoGeneralDesktopHeaderSx as sx } from './sx/header.sx.js'

function getVideoTitle(video) {
  return video?.title || video?.name || 'וידאו'
}

function getYmLabel(video) {
  return video?.monthLabel || video?.ym || ''
}

export default function VideoGeneralHeader({
  video,
  showYm = false,
}) {
  const title = getVideoTitle(video)
  const ymLabel = getYmLabel(video)

  return (
    <Box sx={sx.root}>
      <Box sx={sx.cardTopRow}>
        <Typography level="title-sm" noWrap sx={sx.cardTitle}>
          {title}
        </Typography>

        {showYm && ymLabel ? (
          <Typography level="body-xs" noWrap sx={sx.ym}>
            {ymLabel}
          </Typography>
        ) : null}
      </Box>

      <Divider />
    </Box>
  )
}
