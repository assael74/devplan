// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoDesktopCardMedia.js

import React from 'react'
import { Box, Chip, Tooltip } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { iconUi } from '../../../../../core/icons/iconUi.js'

import { mediaSx as sx } from './sx/media.sx.js'

export default function VideoDesktopCardMedia({
  model,
  actions,
  imgOk,
  setImgOk,
}) {
  return (
    <Box
      sx={sx.media}
      role={actions.canWatch ? 'button' : undefined}
      tabIndex={actions.canWatch ? 0 : undefined}
      onClick={actions.canWatch ? actions.handleWatch : undefined}
      onKeyDown={
        actions.canWatch
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                actions.handleWatch()
              }
            }
          : undefined
      }
    >
      {model.thumb && imgOk ? (
        <Box
          component="img"
          src={model.thumb}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgOk(false)}
          sx={sx.image}
        />
      ) : (
        <Box sx={sx.mediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      <Box sx={sx.mediaOverlay} />

      {actions.canWatch ? (
        <Box sx={sx.playBadge}>
          {iconUi({ id: 'playVideo', size: 'sm' })}
        </Box>
      ) : null}

      <Box sx={sx.mediaBadges}>
        {model.isMissing || model.isPartial ? (
          <Chip size="sm" variant="soft" color="warning" sx={sx.mediaStatusChip}>
            {model.statusLabel}
          </Chip>
        ) : null}

        {model.primaryCategory ? (
          <Tooltip title={model.primaryCategory.label} arrow>
            <Chip
              size="sm"
              variant="soft"
              sx={sx.mediaCategoryChip({ tone: model.primaryCategory.tone })}
              startDecorator={iconUi({
                id: model.primaryCategory.iconId,
                size: 'xs',
              })}
            >
              {model.primaryCategory.label}
            </Chip>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  )
}
