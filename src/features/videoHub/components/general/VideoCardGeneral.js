// src/features/videoHub/components/general/VideoCardGeneral.js

import React, { useMemo } from 'react'
import { Box, Card, Divider } from '@mui/joy'

import { videoCardSx as sx } from './sx/card.sx'
import VideoCardMedia from './VideoCardMedia.js'
import VideoCardHeader from './VideoCardHeader.js'
import VideoTagsBar from './VideoTagsBar.js'

export default function VideoCardGeneral({
  video,
  onShare,
  onWatch,
  onEdit,
  onDelete,
  tagsById,
  showYm = false,
  entityType = 'video',
}) {
  const menuItems = useMemo(() => {
    const items = []

    if (typeof onWatch === 'function') {
      items.push({
        id: 'watch',
        label: 'צפייה',
        icon: 'playVideo',
        onClick: onWatch,
      })
    }

    if (typeof onEdit === 'function') {
      items.push({
        id: 'edit',
        label: 'עריכה',
        icon: 'edit',
        onClick: onEdit,
      })
    }

    if (typeof onShare === 'function') {
      items.push({
        id: 'share',
        label: 'שיתוף',
        icon: 'share',
        onClick: onShare,
      })
    }

    if (typeof onDelete === 'function') {
      items.push({ divider: true })
      items.push({
        id: 'delete',
        label: 'מחיקה',
        icon: 'delete',
        color: 'danger',
        onClick: onDelete,
      })
    }

    return items
  }, [onWatch, onEdit, onShare, onDelete])

  return (
    <Card size='sm' variant="outlined" sx={sx.cardGrid}>
      <VideoCardMedia
        video={video}
        entityType={entityType}
        onWatch={onWatch}
        menuItems={menuItems}
      />

      <Box sx={sx.cardBody}>
        <VideoCardHeader
          video={video}
          showYm={showYm}
        />

        <VideoTagsBar
          video={video}
          tagsById={tagsById}
          iconId="videoGeneral"
        />
      </Box>
    </Card>
  )
}
