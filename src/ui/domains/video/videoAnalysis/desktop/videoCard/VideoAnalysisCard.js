// ui/domains/video/videoAnalysis/desktop/videoCard/VideoAnalysisCard.js

import React, { useMemo } from 'react'
import { Card, Box, Divider } from '@mui/joy'

import VideoCardMedia from './VideoCardMedia'
import VideoCardHeader from './VideoCardHeader'
import VideoTagsBar from './VideoTagsBar'
import { VideoCardLinkage } from './VideoCardLinkage'

import { buildVideoAnalysisSx } from './sx/videoAnalysis.sx'
import { VIDEO_ANALYSIS_CARD_PRESETS } from './videoAnalysisCard.presets'

export default function VideoAnalysisCard({
  video,
  preset = 'videoHub',
  from,
  onWatch,
  onShare,
  onEdit,
  onLink,
  context,
}) {
  const cfg = VIDEO_ANALYSIS_CARD_PRESETS[preset] || VIDEO_ANALYSIS_CARD_PRESETS.videoHub

  const sx = useMemo(
    () => buildVideoAnalysisSx(from || preset),
    [from, preset]
  )
  //console.log(video)

  const menuItems = typeof cfg.menu === 'function' ? cfg.menu({ video, onShare, onEdit, onLink }) : []

  return (
    <Card variant="outlined" sx={sx.cardGrid()}>
      <VideoCardMedia
        sx={sx}
        video={video}
        entityType="videoAnalysis"
        onWatch={onWatch}
        playButtonColor={cfg.playButtonColor}
        menuItems={menuItems}
      />

      <Box sx={sx.cardBody}>
        <VideoCardHeader
          video={video}
          showYm={cfg.showYm}
          sx={sx}
        />

        <Divider />

        <Box sx={sx.linkageZone}>
          <VideoCardLinkage
            video={video}
            context={context}
          />
        </Box>

        <Box sx={sx.tagsZone}>
          <VideoTagsBar
            video={video}
            tagsById={context?.tagsById}
            iconId="videoAnalysis"
            maxVisible={cfg.maxVisibleTags}
          />
        </Box>
      </Box>
    </Card>
  )
}
