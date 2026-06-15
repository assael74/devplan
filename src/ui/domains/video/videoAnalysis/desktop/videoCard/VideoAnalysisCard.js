// ui/domains/video/videoAnalysis/desktop/videoCard/VideoAnalysisCard.js

import React, { useMemo } from 'react'
import { Avatar, Box, Card, Tooltip, Typography } from '@mui/joy'

import VideoCardMedia from './VideoCardMedia'
import VideoTagsBar from './VideoTagsBar'

import { buildVideoAnalysisSx } from './sx/videoAnalysis.sx'
import { VIDEO_ANALYSIS_CARD_PRESETS } from './videoAnalysisCard.presets'
import { buildVideoAnalysisCardModel } from './videoAnalysisCard.model.js'

export default function VideoAnalysisCard({
  video,
  preset = 'videoHub',
  from,
  onWatch,
  onEdit,
  onLink,
  context,
}) {
  const cfg = VIDEO_ANALYSIS_CARD_PRESETS[preset] || VIDEO_ANALYSIS_CARD_PRESETS.videoHub

  const sx = useMemo(
    () => buildVideoAnalysisSx(from || preset),
    [from, preset]
  )
  const model = useMemo(() => buildVideoAnalysisCardModel(video), [video])

  return (
    <Card variant="outlined" sx={sx.cardGrid()}>
      <VideoCardMedia
        sx={sx}
        video={video}
        onWatch={onWatch}
        onLink={onLink}
        onEdit={onEdit}
      />

      <Box sx={sx.cardBody}>
        <Box sx={sx.analysisSummaryRow}>
          <Tooltip title={model.summary} arrow>
            <Typography level="body-xs" noWrap sx={sx.analysisSummary}>
              {'\u05d4\u05e1\u05d1\u05e8'}: {model.summary}
            </Typography>
          </Tooltip>

          <Tooltip title={model.entity.label} arrow>
            <Avatar
              size="sm"
              src={model.entity.avatarSrc || undefined}
              sx={sx.analysisAvatar(model.entity.tone)}
            >
              {model.entity.initials}
            </Avatar>
          </Tooltip>
        </Box>

        <Box sx={sx.tagsZone}>
          <VideoTagsBar
            video={video}
            tagsById={context?.tagsById}
            iconId="videoAnalysis"
            maxVisible={cfg.maxVisibleTags}
            onAddTag={onEdit}
          />
        </Box>
      </Box>
    </Card>
  )
}
