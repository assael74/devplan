import React, { useMemo } from 'react'
import {
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { buildVideoAnalysisCardModel } from './videoAnalysisCard.model.js'
import VideoTagsBar from './VideoTagsBar.js'
import { buildVideoAnalysisSx } from './sx/videoAnalysis.sx.js'

export default function VideoAnalysisMiniCard({
  video,
  context,
  onWatch,
  onEdit,
  onLink,
}) {
  const model = useMemo(() => buildVideoAnalysisCardModel(video), [video])
  const sx = useMemo(() => buildVideoAnalysisSx('videoHubMini'), [])

  const handleWatch = event => {
    event?.stopPropagation?.()
    onWatch?.(video)
  }

  const handleMore = event => {
    event?.stopPropagation?.()
    event?.preventDefault?.()
    onLink?.(video)
  }

  return (
    <Card size="sm" variant="outlined" sx={sx.miniCard()}>
      <Box sx={sx.miniMedia} onClick={handleWatch}>
        <Box sx={sx.analysisCoverPattern} />

        <Box sx={sx.analysisCoverTop}>
          <Chip
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: model.type.iconId, sx: { width: 10, height: 10 } })}
            sx={sx.analysisMiniTypeChip(model.type.tone)}
          >
            {model.type.label}
          </Chip>

          {model.dateLabel ? (
            <Chip size="sm" variant="soft" sx={sx.analysisMiniDateChip}>
              {model.dateLabel}
            </Chip>
          ) : null}
        </Box>

        <Tooltip title={model.title} arrow>
          <Box sx={sx.analysisMiniTitle}>
            {model.title}
          </Box>
        </Tooltip>
      </Box>

      <Box sx={sx.miniBody}>
        <Box sx={sx.miniMetaRow}>
          <Tooltip title={model.entity.label} arrow>
            <Avatar
              size="sm"
              src={model.entity.avatarSrc || undefined}
              sx={sx.analysisMiniAvatar(model.entity.tone)}
            >
              {model.entity.initials}
            </Avatar>
          </Tooltip>

          <Box sx={sx.miniTags}>
            <VideoTagsBar
              video={video}
              tagsById={context?.tagsById}
              iconId="videoAnalysis"
              maxVisible={1}
              onAddTag={onEdit}
            />
          </Box>

          <Tooltip title="שיוך ועריכה" arrow>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onPointerDown={event => event.stopPropagation()}
              onMouseDown={event => event.stopPropagation()}
              onClick={handleMore}
              sx={sx.miniEditButton}
            >
              {iconUi({ id: 'more', sx: { width: 16, height: 16 } })}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Card>
  )
}
