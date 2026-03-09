// src/ui/domains/video/videoAnalysis/VideoCardHeader.js
import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'

export default function VideoCardHeader({ video, showYm = false, topRowSx, sx }) {
  const title = video?.title || video?.name || 'וידאו'

  return (
    <Box sx={{ ...(sx?.cardTopRow || {}), ...(topRowSx || {}) }}>
      <Typography level="title-sm" noWrap sx={sx?.cardTitle}>
        {title}
      </Typography>

      {showYm ? (
        <Box sx={sx?.cardYm}>
          <Chip size="sm" color="warning" variant="solid" sx={sx?.ymChip}>
            {video?.year}
          </Chip>
          <Chip size="sm" color="warning" variant="solid" sx={sx?.ymChip}>
            {video?.month}
          </Chip>
        </Box>
      ) : null}
    </Box>
  )
}
