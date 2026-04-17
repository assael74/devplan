// preview/previewDomainCard/domains/player/videos/components/PlayerVideosEmpty.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { tableSx as sx } from '../sx/playerVideosTable.sx.js'

export default function PlayerVideoEmpty() {
  return (
    <Box sx={sx.emptyBoxSx}>
      <Typography level="body-md" fontWeight={700}>
        אין קטעי וידאו להצגה
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
        נסה לנקות חיפוש או לבטל סינון
      </Typography>
    </Box>
  )
}
