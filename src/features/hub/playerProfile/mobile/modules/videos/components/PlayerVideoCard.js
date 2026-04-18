// playerProfile/mobile/modules/videos/components/PlayerVideoCard.js

import React from 'react'
import { Box, Card, CardContent, CardOverflow, IconButton, Divider } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import {
  MediaSection,
  InfoSection,
  AssignmentSection,
  TagsSection,
  NotesSection,
} from './sections/PlayerVideoSection.js'

import { sectionsSx as sx } from '../sx/sections.sx.js'

export default function PlayerVideoCard({
  video,
  onEdit,
  onOpenNotes,
  onWatchVideo,
}) {
  return (
    <Card variant="outlined" orientation="horizontal" sx={{ width: '100%', p: 0, }}>
      <CardOverflow>
        <MediaSection video={video} onWatch={onWatchVideo} />
      </CardOverflow>

      <CardContent>
        <InfoSection video={video} />
        <Divider />
        <TagsSection video={video} />
      </CardContent>

      <CardOverflow variant="soft" color="primary" sx={sx.editOverFlow}>
        <IconButton variant="plain" onClick={() => onEdit(video)}>
          {iconUi({ id: 'more' })}
        </IconButton>
      </CardOverflow>
    </Card>
  )
}
