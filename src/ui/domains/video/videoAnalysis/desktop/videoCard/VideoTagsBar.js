// ui/domains/video/videoAnalysis/desktop/videoCard/VideoTagsBar.js

import React, { useMemo } from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'
import { alpha } from '@mui/system'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { VIDEO_SEED_TAG_BY_ID } from '../../../../../../shared/video/videoSeedTags.constants.js'
import { getTagTypeMeta } from '../../../../tags/tagTypeMeta.js'

const normalizeArr = value => (Array.isArray(value) ? value : value ? [value] : [])
const toStr = value => (value == null ? '' : String(value)).trim()

const getFromMapOrObject = (bucket, key) => {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null
  return null
}

const getTagLabel = tag => (
  typeof tag === 'string'
    ? toStr(tag)
    : toStr(tag?.tagName || tag?.name || tag?.label || tag?.slug)
)

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

  const resolvedTags = useMemo(() => {
    const inlineTags = normalizeArr(video?.tagsFull)
    const inlineById = inlineTags.reduce((acc, tag) => {
      const id = toStr(tag?.id || tag?.tagId)
      if (id) acc[id] = tag
      return acc
    }, {})

    const fromIds = tagIds
      .map(id => (
        getFromMapOrObject(tagsById, id) ||
        inlineById[id] ||
        VIDEO_SEED_TAG_BY_ID[id] ||
        null
      ))
      .filter(tag => getTagLabel(tag))

    if (fromIds.length) return fromIds

    return inlineTags.filter(tag => getTagLabel(tag))
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

  if (!resolvedTags.length) {
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

  const visible = resolvedTags.slice(0, maxVisible)
  const hiddenCount = resolvedTags.length - visible.length
  const hiddenTags = resolvedTags.slice(maxVisible)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 24 }}>
        {visible.map((tag, idx) => {
          const label = getTagLabel(tag)
          const typeMeta = getTagTypeMeta(tag)
          const color = typeMeta.color

          const categoryLabel = typeMeta.label || 'ללא קטגוריה'

          const tooltipTitle = (
            <Box sx={{ display: 'grid', gap: 0.25, direction: 'rtl', textAlign: 'left' }}>
              <Typography level="body-xs" sx={{ color: 'inherit', fontWeight: 600 }}>
                קטגוריה: {categoryLabel}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'inherit' }}>
                תג: {label}
              </Typography>
            </Box>
          )

          return (
            <Tooltip
              key={`${toStr(tag?.id || tag?.tagId) || label}-${idx}`}
              title={tooltipTitle}
              arrow
              placement="top"
            >
              <Chip
              size="sm"
              variant="outlined"
              startDecorator={iconUi({
                id: typeMeta.iconId || iconId,
                sx: { height: 10, width: 10 },
              })}
              sx={{
                height: 20,
                fontSize: 10,
                maxWidth: 110,
                ...(color ? {
                  color,
                  bgcolor: alpha(color, 0.08),
                  borderColor: alpha(color, 0.28),
                } : null),
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            >
              {label}
              </Chip>
            </Tooltip>
          )
        })}

        {hiddenCount > 0 && (
          <Tooltip
            title={(
              <Box sx={{ display: 'grid', gap: 0.5, direction: 'rtl', textAlign: 'left' }}>
                {hiddenTags.map((tag, idx) => {
                  const label = getTagLabel(tag)
                  const typeMeta = getTagTypeMeta(tag)
                  const categoryLabel = typeMeta.label || 'ללא קטגוריה'

                  return (
                    <Box key={`${toStr(tag?.id || tag?.tagId) || label}-${idx}`}>
                      <Typography level="body-xs" sx={{ color: 'inherit', fontWeight: 600 }}>
                        קטגוריה: {categoryLabel}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'inherit' }}>
                        תג: {label}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}
            arrow
            placement="top"
          >
            <Chip size="sm" variant="soft" sx={{ height: 20, fontSize: 11, fontWeight: 500 }}>
              +{hiddenCount}
            </Chip>
          </Tooltip>
        )}

      {addButton}
    </Box>
  )
}
