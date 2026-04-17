// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingVideo.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DriveVideoEmbed from '../../../../../../../../ui/domains/video/DriveVideoEmbed.js'

import { formSx } from '../sx/form.sx.js'

export default function MeetingVideo({ selected, onOpenVideo }) {
  const hasVideo = Boolean(selected?.videoId)

  return (
    <Sheet sx={{ ...formSx.panel, overflow: 'hidden' }} variant="outlined">
      <Box sx={formSx.panelTitleRow}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>וידאו</Typography>

        {hasVideo && onOpenVideo ? (
          <Button
            size="sm"
            variant="soft"
            startDecorator={<PlayArrowIcon />}
            onClick={() => onOpenVideo(selected)}
          >
            פתח נגן
          </Button>
        ) : null}
      </Box>

      {hasVideo ? (
        <Box sx={formSx.hasVideoBox}>
          <DriveVideoEmbed link={selected.videoId} height={320} radius={12} />
        </Box>
      ) : (
        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
          לא צורף וידאו למפגש.
        </Typography>
      )}
    </Sheet>
  )
}
