// src/features/bulkActions/videos/delete/components/VideosBulkDeleteSummary.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  videosDeleteModalSx as sx,
} from '../sx/videosDeleteModal.sx.js'

const items = [
  {
    key: 'totalVideos',
    label: 'כמות קטעי וידאו',
  },
  {
    key: 'needsTagging',
    label: 'ללא אפיון',
  },
]

export default function VideosBulkDeleteSummary({
  summary = {},
}) {
  return (
    <Box sx={sx.summaryGrid}>
      {items.map(item => (
        <Box
          key={item.key}
          sx={sx.summaryCard}
        >
          <Typography
            level="body-xs"
            color="neutral"
          >
            {item.label}
          </Typography>

          <Typography level="h3">
            {summary[item.key] || 0}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
