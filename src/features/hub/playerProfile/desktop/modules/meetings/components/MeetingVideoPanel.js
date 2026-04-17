import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DriveVideoEmbed from '../../../../../../../ui/domains/video/DriveVideoEmbed.js'

export default function MeetingVideoPanel({ sx, selected, onOpenVideo }) {
  const hasVideo = Boolean(selected?.videoId)

  return (
    <Sheet sx={{ ...sx.panel, overflow: 'hidden' }} variant="outlined">
      <Box sx={sx.panelTitleRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="title-sm" sx={sx.panelTitle}>וידאו</Typography>

        {hasVideo && onOpenVideo ? (
          <Button size="sm" variant="soft" startDecorator={<PlayArrowIcon />} onClick={() => onOpenVideo(selected)}>
            פתח נגן
          </Button>
        ) : null}
      </Box>

      {hasVideo ? (
        <Box sx={{ overflow: 'hidden', borderRadius: 12, width: '100%', '& iframe': { display: 'block', width: '100%' } }}>
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
