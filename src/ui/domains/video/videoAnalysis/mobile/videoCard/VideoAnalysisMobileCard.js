// ui/domains/video/videoAnalysis/mobile/videoCard/VideoAnalysisMobileCard.js

import React from 'react'
import { Box, Card, CardContent, CardOverflow, IconButton, Divider } from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import { getEntityColors } from '../../../../../core/theme/Colors.js'

import {
  VideoMobileMedia,
  VideoMobileInfo,
  VideoMobileTags,
} from '../sharedUi/VideoMobileSharedUi.js'

import { sharedSx as sx } from '../sharedUi/shared.ui.sx'

const c = getEntityColors('videoAnalysis')

export default function VideoAnalysisMobileCard({
  video,
  onWatch,
  onEdit,
}) {
  return (
    <Card variant="outlined" orientation="horizontal" sx={{ width: '100%', p: 0, gap: 0.5 }}>
      <CardOverflow>
        <VideoMobileMedia video={video} onWatch={onWatch} />
      </CardOverflow>

        <CardContent sx={sx.content}>
          <VideoMobileInfo video={video} />

          <Divider />

          <VideoMobileTags video={video} />
        </CardContent>

      <CardOverflow variant="soft" color="primary" sx={sx.overflow}>
        <IconButton size="sm" variant="plain" onClick={() => onEdit(video)}>
          {iconUi({ id: 'more' })}
        </IconButton>
      </CardOverflow>
    </Card>
  )
}
