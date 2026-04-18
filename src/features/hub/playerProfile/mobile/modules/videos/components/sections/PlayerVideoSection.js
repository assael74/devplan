// playerProfile/mobile/modules/videos/components/sections/PlayerVideoSection.js

import React, { useMemo } from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { getDriveThumbUrl } from '../../../../../../../../shared/media/driveLinks.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'

import { VIDEOANALYSIS_ASSIGNMENTS } from '../../../../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

const safe = (v) => (v == null ? '' : String(v))

const getDateLabel = (video) => safe(video?.monthLabel || '—')

export function getVideoAssignmentId(video) {
  const objectType = safe(video?.objectType).toLowerCase()
  const contextType = safe(video?.contextType).toLowerCase()

  if (!objectType || !contextType) return ''

  const match = VIDEOANALYSIS_ASSIGNMENTS.find((item) => {
    return (
      safe(item?.objectType).toLowerCase() === objectType &&
      safe(item?.contextType).toLowerCase() === contextType
    )
  })

  return match?.id || ''
}

export function getVideoAssignmentModel(video) {
  const objectType = safe(video?.objectType).toLowerCase()
  const contextType = safe(video?.contextType).toLowerCase()

  if (!objectType || !contextType) return null

  const match = VIDEOANALYSIS_ASSIGNMENTS.find((item) => {
    return (
      safe(item?.objectType).toLowerCase() === objectType &&
      safe(item?.contextType).toLowerCase() === contextType
    )
  })

  return match || null
}

export function getAssignmentIcon(video, fallback = 'videos') {
  const model = getVideoAssignmentModel(video)
  return model?.idIcon || fallback
}

export function getAssignmentText(video, fallback = 'ללא שיוך') {
  const model = getVideoAssignmentModel(video)
  return model?.labelH || model?.label || fallback
}

const getTagLabel = (tag) =>
  safe(tag?.tagName || tag?.label || tag?.name || 'תג')

const getNotes = (video) => safe(video?.notes || '')

const getVideoLink = (video) =>
  safe(video?.link || video?.videoLink || video?.url || video?.videoUrl)

const getVideoThumb = (video) => {
  const link = getVideoLink(video)
  const base = getDriveThumbUrl(link)
  if (!base) return ''
  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

/* ---------------- MEDIA ---------------- */

export function MediaSection({ video, onWatch }) {
  const thumb = useMemo(() => getVideoThumb(video), [video])
  const hasThumb = !!thumb
  const canWatch = !!getVideoLink(video) && typeof onWatch === 'function'

  return (
    <Box
      sx={sx.mediaRootSx}
      onClick={canWatch ? () => onWatch(video) : undefined}
      role={canWatch ? 'button' : undefined}
      tabIndex={canWatch ? 0 : undefined}
      onKeyDown={
        canWatch
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onWatch(video)
              }
            }
          : undefined
      }
    >
      {hasThumb ? (
        <>
          <Box
            component="img"
            src={thumb}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={sx.mediaImgSx}
          />
          <Box sx={sx.mediaOverlaySx} />
        </>
      ) : (
        <Box sx={sx.mediaFallbackSx}>
          <ImageNotSupportedRounded />
        </Box>
      )}

      {video?.hasLink ? (
        <Box sx={sx.mediaPlaySx}>
          {iconUi({ id: 'playVideo', sx: { fontSize: 18 } })}
        </Box>
      ) : null}
    </Box>
  )
}

/* ---------------- INFO ---------------- */

export function InfoSection({ video }) {
  const title = safe(video?.name || 'קטע וידאו')
  const dateLabel = getDateLabel(video)
  const assignmentIcon = getAssignmentIcon(video)
  const assignmentText = getAssignmentText(video)

  return (
    <Box sx={{ pt: 1 }}>
      <Typography
        level="title-sm"
        sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}
        startDecorator={iconUi({id: assignmentIcon, size: 'sm'})}
      >
        {title}
      </Typography>

      <Typography level="body-xs" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {dateLabel}
      </Typography>
    </Box>
  )
}

/* ---------------- TAGS ---------------- */

export function TagsSection({ video }) {
  const tagsFull = Array.isArray(video?.tagsFull) ? video.tagsFull : []
  const visibleTags = useMemo(() => tagsFull.slice(0, 4), [tagsFull])
  const extraTagsCount = Math.max(tagsFull.length - visibleTags.length, 0)

  if (!visibleTags.length) {
    return (
      <Box sx={sx.tagsCellSx}>
        <Typography level="body-xs" sx={sx.emptyTextSx}>
          ללא תגיות
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.tagsCellSx}>
      <Box sx={sx.tagsWrapSx}>
        {visibleTags.map((tag, index) => {
          const label = getTagLabel(tag)

          return (
            <Chip
              key={tag?.id || tag?.tagId || `${label}_${index}`}
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: 'children', size: 'sm' })}
              sx={sx.tagChipSx}
            >
              {label}
            </Chip>
          )
        })}

        {extraTagsCount > 0 ? (
          <Chip size="sm" variant="plain" color="neutral" sx={sx.extraChipSx}>
            +{extraTagsCount}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
