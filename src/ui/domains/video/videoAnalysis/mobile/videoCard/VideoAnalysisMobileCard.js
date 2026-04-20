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

const c = getEntityColors('videoAnalysis')

export default function VideoAnalysisMobileCard({
  video,
  onWatch,
  onEdit,
}) {
  return (
    <Card variant="outlined" orientation="horizontal" sx={{ width: '100%', p: 0 }}>
      <CardOverflow>
        <VideoMobileMedia video={video} onWatch={onWatch} />
      </CardOverflow>

        <CardContent>
          <VideoMobileInfo video={video} />

          <Divider />

          <VideoMobileTags video={video} />
        </CardContent>

      <CardOverflow
        variant="soft"
        color="primary"
        sx={{
          justifyContent: 'center',
          borderLeft: '1px solid',
          borderColor: 'divider',
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          bgcolor: c.bg
        }}
      >
        <IconButton size="sm" variant="plain" onClick={() => onEdit(video)}>
          {iconUi({ id: 'more' })}
        </IconButton>
      </CardOverflow>
    </Card>
  )
}
