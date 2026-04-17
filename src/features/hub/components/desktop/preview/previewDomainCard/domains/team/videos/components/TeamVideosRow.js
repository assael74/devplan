// preview/previewDomainCard/domains/team/videos/components/TeamVideosRow.js

import React, { useMemo, useCallback } from 'react'
import { Box, Divider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Tooltip, Typography, ListItemDecorator } from '@mui/joy'
import MoreVert from '@mui/icons-material/MoreVert'

import { VideoPreviewMedia } from '../../../../../../../../../../ui/domains/video/videoAnalysis'
import { compactMediaSx } from '../../../../../../../../../../ui/domains/video/videoAnalysis/sx/videoPreviewMedia.sx.js'
import { useLifecycle } from '../../../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { rowSx as sx } from '../sx/teamVideosRow.sx.js'

export default function TeamVideosRow({
  row,
  onWatch,
  onEdit,
  context
}) {
  const video = row
  const tagsFull = Array.isArray(row?.tagsFull) ? row.tagsFull : []
  const tagsPreview = tagsFull.slice(0, 2).map((t) => t?.tagName || t?.label || 'תג').filter(Boolean).join(' · ')

  return (
    <Box sx={sx.rowCardSx}>
      <Box sx={sx.mediaCellSx}>
        <VideoPreviewMedia
          video={row}
          sx={compactMediaSx}
          showMenu={false}
          showWatch={false}
          clickable
          onWatch={onWatch}
        />
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.videoNameSx}>
          {row.name}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-xs" sx={sx.videoNameSx}>
          {row.assignmentText}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-xs" sx={sx.videoDateSx}>
          {row.monthLabel}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-xs" sx={sx.videoNameSx} endDecorator={iconUi({id: 'tag'})}>
          {row.tagsCount}
        </Typography>
      </Box>

      <Box sx={sx.notsIcon(!!row?.hasNotes)}>
        {iconUi({id: 'notes'})}
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת וידאו">
          <IconButton size="sm" onClick={() => onEdit(video)}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
