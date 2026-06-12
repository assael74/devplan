// preview/previewDomainCard/domains/player/videos/components/PlayerVideosRow.js

import React from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/joy'

import { VideoPreviewMedia } from '../../../../../../../../../../ui/domains/video/videoAnalysis'
import {
  compactMediaSx
} from '../../../../../../../../../../ui/domains/video/videoAnalysis/desktop/videoCard/sx/videoPreviewMedia.sx.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { rowSx as sx } from '../sx/playerVideosRow.sx.js'

export default function PlayerVideosRow({
  row,
  onWatch,
  onEdit,
}) {
  const video = row
  const tagsFull = []
  const tagsPreview = tagsFull.slice(0, 2).map((t) => t?.tagName || t?.label || 'תג').filter(Boolean).join(' · ')

  void tagsPreview

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
