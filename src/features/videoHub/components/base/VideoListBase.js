// src/features/videoHub/components/base/VideoListBase.js
import React from 'react'
import { Box, Typography } from '@mui/joy'

export default function VideoListBase({
  items,
  sx,
  gridKey,
  emptyTitle = 'אין פריטים',
  renderItem,
}) {
  if (!items?.length) {
    return (
      <Box sx={sx?.empty}>
        <Typography level="h4" sx={sx?.emptyTitle}>
          {emptyTitle}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={typeof sx?.gridWrap === 'function' ? sx.gridWrap(gridKey) : sx?.gridWrap}>
      {items.map((item) => renderItem(item))}
    </Box>
  )
}
