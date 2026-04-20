// ui/domains/video/videoAnalysis/desktop/videoRow/VideoAnalysisRow.js

import React from 'react'
import { Box, Card, CardOverflow, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import { rowSx as sx } from './row.sx.js'
import {
  VideoMedia,
  VideoTitleBlock,
  VideoMetaBlock,
  VideoTags,
} from '../sharedUi/VideoSharedUi.js'

export default function VideoAnalysisRow({
  video,
  onWatch,
  onEdit,
  actionMode = 'menu_only',
}) {
  const showWatch = actionMode === 'watch_and_menu'

  return (
    <Card variant="outlined" orientation="horizontal" sx={sx.root}>
      <Box sx={sx.mainWrap}>
        <VideoMedia video={video} onWatch={onWatch} />

        <Box sx={sx.contentShell}>
          <Box sx={sx.upperRow}>
            <VideoTitleBlock video={video} />
            <VideoMetaBlock video={video} />
          </Box>

          <VideoTags video={video} />
        </Box>
      </Box>

      <CardOverflow variant="soft" sx={sx.actionsRail}>
        <Box sx={sx.actionsColumn}>
          <IconButton size="sm" variant="plain" onClick={() => onEdit(video)}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Box>
      </CardOverflow>
    </Card>
  )
}
