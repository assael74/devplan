// playerProfile/mobile/modules/videos/components/PlayerVideoRow.js

import React from 'react'
import { Box, Card, IconButton, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import {
  MediaSection,
  InfoSection,
  AssignmentSection,
  TagsSection,
  NotesSection,
} from './sections/PlayerVideoSection.js'

import { rowSx as sx } from '../sx/row.sx.js'

export default function PlayerVideoRow({
  video,
  onEdit,
  onOpenNotes,
  onWatchVideo,
}) {
  const handleEdit = () => {
    if (onEdit) onEdit(video)
  }

  return (
    <Card variant="outlined" sx={sx.card}>
      <Box sx={sx.topRow}>
        <MediaSection video={video} onWatch={onWatchVideo} />

        <InfoSection video={video} />
      </Box>

      <TagsSection video={video} />

      <Box sx={sx.bottomRow}>
        <NotesSection video={video} onOpenNotes={onOpenNotes} />

        <Box sx={sx.actionsWrap}>
          {video?.hasLink ? (
            <IconButton size="sm" variant="soft" onClick={() => onWatchVideo?.(video)}>
              {iconUi({ id: 'play' })}
            </IconButton>
          ) : null}

          <IconButton size="sm" variant="plain" onClick={handleEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Box>
      </Box>
    </Card>
  )
}
