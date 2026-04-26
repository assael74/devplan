// ui/domains/video/videoGeneral/mobile/videoCard/VideoGeneralMobileCard.js

import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardOverflow,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  ListItemDecorator,
  Divider,
} from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'

import {
  VideoMobileMedia,
  VideoMobileInfo,
  VideoMobileTags,
} from '../sharedUi/VideoMobileSharedUi.js'

import { sharedSx as sx } from '../sharedUi/shared.ui.sx.js'

export default function VideoGeneralMobileCard({
  video,
  onWatch,
  onEdit,
  onShare,
  onDelete,
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
    <Card
      variant="outlined"
      orientation="horizontal"
      sx={{
        width: '100%',
        p: 0,
        gap: 0.5,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <CardOverflow>
        <VideoMobileMedia video={video} onWatch={onWatch} />
      </CardOverflow>

      <CardContent sx={sx.content}>
        <VideoMobileInfo video={video} />

        <Divider />

        <VideoMobileTags video={video} />
      </CardContent>

      <CardOverflow variant="soft" color="neutral" sx={sx.overflow}>
      <IconButton size="sm" variant="plain" onClick={() => onEdit(video)}>
        {iconUi({ id: 'more' })}
      </IconButton>
      </CardOverflow>
    </Card>
  )
}
