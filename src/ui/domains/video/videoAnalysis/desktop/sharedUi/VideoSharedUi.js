// ui/domains/video/videoAnalysis/desktop/sharedUi/VideoSharedUi.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography, Tooltip } from '@mui/joy'
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
  getVideoNotes,
  getVideoHasNotes,
} from '../sharedLogic/videoDisplay.utils.js'

import { sharedSx as sx } from './shared.ui.sx.js'

export function VideoMedia({ video, onWatch }) {
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
          {iconUi({ id: 'playVideo', sx: { fontSize: 13, color: '#DC2626' } })}
        </Box>
      ) : null}
    </Box>
  )
}

export function VideoTitleBlock({ video }) {
  const title = getVideoTitle(video)
  const assignmentIcon = getVideoAssignmentIcon(video)
  const assignmentText = getVideoAssignmentText(video)

  return (
    <Box sx={sx.titleWrap}>
      <Typography level="title-sm" sx={sx.title} title={title}>
        "{title}"
      </Typography>

      <Box sx={sx.subtitleRow}>
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: assignmentIcon, size: 'sm' })}
          sx={{ maxWidth: 'fit-content', fontWeight: 600 }}
        >
          {assignmentText}
        </Chip>
      </Box>
    </Box>
  )
}

export function VideoMetaBlock({ video }) {
  const dateLabel = getVideoDateLabel(video)
  const hasNotes = getVideoHasNotes(video)
  const notes = getVideoNotes(video)

  return (
    <Box sx={sx.metaWrap}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
        <Typography level="body-xs" noWrap startDecorator={iconUi({ id: 'calendar', size: 'sm' })}>
          {dateLabel}
        </Typography>
      </Box>

      <Box sx={sx.boxWrap(hasNotes)}>
        <Tooltip title={notes} arrow>
          <Typography level="body-xs" sx={hasNotes ? sx.notesText : sx.emptyText} title={hasNotes ? notes : 'ללא הערות'}>
            {hasNotes ? notes : 'ללא הערות'}
          </Typography>
        </Tooltip>
      </Box>
    </Box>
  )
}

export function VideoTags({ video }) {
  const visibleTags = useMemo(() => getVisibleVideoTags(video, 4), [video])
  const extraTagsCount = getExtraVideoTagsCount(video, 4)

  if (!visibleTags.length) {
    return (
      <Box sx={sx.tagsCell}>
        <Typography level="body-xs" sx={sx.emptyText}>
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
