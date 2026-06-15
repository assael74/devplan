// ui/domains/video/videoAnalysis/VideoTagsBar.js

import React, { useMemo } from 'react'
import { Box, Chip, IconButton, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

const normalizeArr = value => (Array.isArray(value) ? value : value ? [value] : [])
const toStr = value => (value == null ? '' : String(value)).trim()

const getFromMapOrObject = (bucket, key) => {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null
  return null
}

export default function VideoTagsBar({
  video,
  tagsById,
  iconId = 'tags',
  maxVisible = 3,
  onAddTag,
}) {
  const tagIds = useMemo(() => {
    const arr = normalizeArr(video?.tagsFull)

    const primitiveIds = arr
      .filter(item => typeof item === 'string' || typeof item === 'number')
      .map(toStr)
      .filter(Boolean)

    if (primitiveIds.length) return primitiveIds

    const objectIds = arr
      .map(tag => toStr(tag?.id || tag?.tagId))
      .filter(Boolean)

    if (objectIds.length) return objectIds

    return normalizeArr(video?.tagIds).map(toStr).filter(Boolean)
  }, [video?.tagsFull, video?.tagIds])

  const tagLabels = useMemo(() => {
    if (!tagsById) {
      return normalizeArr(video?.tagsFull)
        .map(tag => toStr(tag?.tagName || tag?.name || tag?.label))
        .filter(Boolean)
    }

    return tagIds
      .map(id => getFromMapOrObject(tagsById, id))
      .map(tag => (typeof tag === 'string' ? tag : toStr(tag?.tagName || tag?.name || tag?.label)))
      .filter(Boolean)
  }, [tagIds, tagsById, video?.tagsFull])

  const handleAddTag = event => {
    event?.stopPropagation?.()
    onAddTag?.(video)
  }

  const addButton = onAddTag ? (
    <Tooltip title="הוספת תג" arrow>
      <IconButton
        size="sm"
        variant="soft"
        color="primary"
        onClick={handleAddTag}
        sx={{ minWidth: 22, minHeight: 22, '--IconButton-size': '22px', borderRadius: 999 }}
      >
        {iconUi({ id: 'add', sx: { width: 14, height: 14 } })}
      </IconButton>
    </Tooltip>
  ) : null

  if (!tagLabels.length) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 24 }}>
        <Chip
          size="sm"
          variant="outlined"
          startDecorator={iconUi({ id: 'tags', sx: { height: 10, width: 10 } })}
          sx={{ height: 20, fontSize: 10, opacity: 0.65 }}
        >
          ללא תגים
        </Chip>
        {addButton}
      </Box>
    )
  }

  const visible = tagLabels.slice(0, maxVisible)
  const hiddenCount = tagLabels.length - visible.length
  const tooltipText = tagLabels.join(' · ')

  return (
    <Tooltip title={tooltipText} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 24 }}>
        {visible.map((label, idx) => (
          <Chip
            key={`${label}-${idx}`}
            size="sm"
            variant="outlined"
            startDecorator={iconUi({ id: iconId, sx: { height: 10, width: 10 } })}
            sx={{
              height: 20,
              fontSize: 10,
              maxWidth: 110,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          >
            {label}
          </Chip>
        ))}

        {hiddenCount > 0 && (
          <Chip size="sm" variant="soft" sx={{ height: 20, fontSize: 11, fontWeight: 500 }}>
            +{hiddenCount}
          </Chip>
        )}

        {addButton}
      </Box>
    </Tooltip>
  )
}
