// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralTagsBar.js

import React, { useMemo } from 'react'
import { Box, Chip, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import { videoGeneralDesktopTagsSx as sx } from './sx/tags.sx.js'

const normalizeArr = (value) => {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

const toStr = (value) => {
  return value == null ? '' : String(value).trim()
}

function getFromMapOrObject(bucket, key) {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null
  return null
}

function getTagId(tag) {
  return toStr(tag?.id || tag?.tagId || tag)
}

function getTagLabel(tag) {
  return toStr(tag?.tagName || tag?.name || tag?.label || tag)
}

export default function VideoGeneralTagsBar({
  video,
  tagsById,
  iconId = 'tags',
  maxVisible = 3,
}) {
  const tagIds = useMemo(() => {
    const fullTags = normalizeArr(video?.tagsFull)
      .map(getTagId)
      .filter(Boolean)

    if (fullTags.length) return fullTags

    return normalizeArr(video?.tagIds || video?.tags)
      .map(toStr)
      .filter(Boolean)
  }, [video?.tagsFull, video?.tagIds, video?.tags])

  const tagLabels = useMemo(() => {
    if (!tagsById) {
      return normalizeArr(video?.tagsFull)
        .map(getTagLabel)
        .filter(Boolean)
    }

    return tagIds
      .map((id) => getFromMapOrObject(tagsById, id))
      .map((tag) => {
        if (typeof tag === 'string') return tag
        return getTagLabel(tag)
      })
      .filter(Boolean)
  }, [tagIds, tagsById, video?.tagsFull])

  if (!tagLabels.length) {
    return (
      <Chip
        size="sm"
        variant="outlined"
        startDecorator={iconUi({ id: 'tags', sx: { height: 10, width: 10 } })}
        sx={sx.emptyChip}
      >
        ללא תגים
      </Chip>
    )
  }

  const visible = tagLabels.slice(0, maxVisible)
  const hiddenCount = tagLabels.length - visible.length
  const tooltipText = tagLabels.join(' · ')

  return (
    <Tooltip title={tooltipText} arrow>
      <Box sx={sx.wrap}>
        {visible.map((label, index) => (
          <Chip
            key={`${label}-${index}`}
            size="sm"
            variant="outlined"
            startDecorator={iconUi({ id: iconId, sx: { height: 10, width: 10 } })}
            sx={sx.chip}
          >
            {label}
          </Chip>
        ))}

        {hiddenCount > 0 ? (
          <Chip size="sm" variant="soft" sx={sx.moreChip}>
            +{hiddenCount}
          </Chip>
        ) : null}
      </Box>
    </Tooltip>
  )
}
