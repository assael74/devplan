// ui/domains/video/videoAnalysis/VideoCardMedia.js

import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { getDrivePreviewUrl } from '../../../../../../shared/media/driveLinks'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { buildVideoAnalysisCardModel } from './videoAnalysisCard.model.js'

export default function VideoCardMedia({
  sx,
  video,
  onWatch,
  onLink,
  onEdit
}) {
  const model = useMemo(() => buildVideoAnalysisCardModel(video), [video])

  const link = video?.link || video?.videoLink || ''
  const preview = useMemo(() => getDrivePreviewUrl(link), [link])
  const canWatch = !!preview

  const handleWatch = () => {
    if (!canWatch) return
    onWatch(video)
  }

  const handleAction = event => {
    event?.stopPropagation()
    event?.preventDefault()
    onLink(video)
  }

  return (
    <Box
      sx={sx?.cardMedia}
      role={canWatch ? 'button' : undefined}
      tabIndex={canWatch ? 0 : undefined}
      onClick={handleWatch}
      onKeyDown={event => {
        if (!canWatch) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleWatch()
        }
      }}
    >
      <Box sx={sx?.analysisCoverPattern} />

      <Box sx={sx?.analysisCoverTop}>
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: model.type.iconId, sx: { width: 12, height: 12 } })}
          sx={sx?.analysisTypeChip(model.type.tone)}
        >
          {model.type.label}
        </Chip>

        {model.dateLabel ? (
          <Chip size="sm" variant="soft" sx={sx?.analysisDateChip}>
            {model.dateLabel}
          </Chip>
        ) : null}
      </Box>

      <Tooltip title={model.title} arrow>
        <Box
          sx={sx?.analysisCoverTitle}
        >
          {model.title}
        </Box>
      </Tooltip>

      <Box sx={sx?.menuBox}>
        <Tooltip title="שיוך ועריכה" arrow>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onPointerDown={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
            onClick={handleAction}
            sx={{ minWidth: 24, minHeight: 24, '--IconButton-size': '24px' }}
          >
            {iconUi({ id: 'edit', sx: { width: 16, height: 16 } })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
