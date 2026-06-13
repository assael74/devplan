// src/features/bulkActions/videos/delete/components/VideosBulkDeleteStatusChip.js

import React from 'react'
import Chip from '@mui/joy/Chip'

import {
  VIDEO_TAGGING_STATUS,
} from '../../../../../shared/video/index.js'

export default function VideosBulkDeleteStatusChip({
  video,
}) {
  const status =
    video?.taggingStatus ||
    video?.status ||
    ''

  if (status === VIDEO_TAGGING_STATUS.NEEDS_TAGGING) {
    return (
      <Chip
        size="sm"
        color="danger"
        variant="soft"
      >
        ללא אפיון
      </Chip>
    )
  }

  if (status === VIDEO_TAGGING_STATUS.PARTIAL) {
    return (
      <Chip
        size="sm"
        color="warning"
        variant="soft"
      >
        אפיון חלקי
      </Chip>
    )
  }

  if (status) {
    return (
      <Chip
        size="sm"
        color="success"
        variant="soft"
      >
        מאופיין
      </Chip>
    )
  }

  return (
    <Chip
      size="sm"
      color="neutral"
      variant="soft"
    >
      ללא סטטוס
    </Chip>
  )
}
