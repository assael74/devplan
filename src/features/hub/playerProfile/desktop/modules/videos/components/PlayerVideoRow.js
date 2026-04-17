// playerProfile/modules/videos/components/PlayerVideoRow.js

import React from 'react'
import { Box, Divider, Tooltip, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  MediaSection,
  InfoSection,
  AssignmentSection,
  TagsSection,
  NotesSection,
  ActionsSection,
} from './sections/PlayerVideoSection.js'

import { rowSx as sx } from '../sx/playerVideos.row.sx.js'

const safe = (v) => (v == null ? '' : String(v))

const getNotes = (video) => safe(video?.notes || '')

export default function PlayerVideoRow({
  video,
  onEdit,
  onOpenNotes,
  onWatchVideo
}) {
  const notes = getNotes(video)
  const hasNotes = notes.trim().length > 0

  const handleWatch = () => {
    if (onWatchVideo) onWatchVideo(video)
  }

  const handleEdit = () => {
    if (onEdit) onEdit(video)
  }

  const handleOpenNotes = () => {
    if (onOpenNotes) onOpenNotes(video)
  }

  return (
    <Box sx={sx.rowCardSx}>
      <MediaSection video={video} onWatch={onWatchVideo} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <InfoSection video={video} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <AssignmentSection video={video} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <TagsSection video={video} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <NotesSection video={video} onOpenNotes={onOpenNotes} />

      <Divider orientation="vertical" sx={sx.dividerSx} />

      <Box sx={sx.actionsCellSx}>
        <Tooltip title="עריכת נתוני וידאו">
          <IconButton size="sm" variant="plain" onClick={handleEdit}>
            {iconUi({id: 'more'})}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
