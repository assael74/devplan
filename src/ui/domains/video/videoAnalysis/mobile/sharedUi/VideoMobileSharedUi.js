// ui/domains/video/videoAnalysis/mobile/sharedUi/VideoMobileSharedUi.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import {
  getVideoAssignmentIcon,
  getVideoAssignmentText,
} from '../sharedLogic/videoAssignment.utils.js'
import {
  getVideoThumb,
  getVideoLink,
} from '../sharedLogic/videoMedia.utils.js'
import {
  getVideoTitle,
  getVideoDateLabel,
  getVideoTagLabel,
  getVisibleVideoTags,
  getExtraVideoTagsCount,
} from '../sharedLogic/videoDisplay.utils.js'

import { sharedSx as sx } from './shared.ui.sx'

export function VideoMobileMedia({ video, onWatch }) {
  const thumb = useMemo(() => getVideoThumb(video), [video])
  const canWatch = !!getVideoLink(video) && typeof onWatch === 'function'

  return (
    <Box
      sx={sx.mediaRoot}
      onClick={canWatch ? () => onWatch(video) : undefined}
      role={canWatch ? 'button' : undefined}
      tabIndex={canWatch ? 0 : undefined}
      onKeyDown={
        canWatch
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onWatch(video)
              }
            }
          : undefined
      }
    >
      {thumb ? (
        <>
          <Box
            component="img"
            src={thumb}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={sx.mediaImg}
          />
          <Box sx={sx.mediaOverlay} />
        </>
      ) : (
        <Box sx={sx.mediaFallback}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      {getVideoLink(video) ? (
        <Box sx={sx.mediaPlay}>
          {iconUi({ id: 'playVideo', sx: { fontSize: 12, color: '#f01313' } })}
        </Box>
      ) : null}
    </Box>
  )
}

export function VideoMobileInfo({ video }) {
  const title = getVideoTitle(video)
  const dateLabel = getVideoDateLabel(video)
  const assignmentIcon = getVideoAssignmentIcon(video)
  const assignmentText = getVideoAssignmentText(video)

  return (
    <Box sx={{ pt: 1 }}>
      <Typography level="title-sm" sx={sx.title} startDecorator={iconUi({id: assignmentIcon, size: 'sm'})}>
        "{title}"
      </Typography>

      <Typography level="body-xs" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {dateLabel}
      </Typography>
    </Box>
  )
}

export function VideoMobileTags({ video }) {
  const visibleTags = useMemo(() => getVisibleVideoTags(video, 2), [video])
  const extraTagsCount = getExtraVideoTagsCount(video, 2)
  
  if (!visibleTags.length) {
    return (
      <Box sx={sx.tagsCell}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
          ללא תגיות
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.tagsCell}>
      <Box sx={sx.tagsWrap}>
        {visibleTags.map((tag, index) => {
          const label = getVideoTagLabel(tag)

          return (
            <Chip
              key={tag?.id || tag?.tagId || `${label}_${index}`}
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: 'children', size: 'sm' })}
              sx={sx.tagChip}
            >
              {label}
            </Chip>
          )
        })}

        {extraTagsCount > 0 ? (
          <Chip size="sm" variant="plain" color="neutral" sx={{ fontWeight: 700 }}>
            +{extraTagsCount}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
