// C:\projects\devplan\src\ui\domains\video\videoAnalysis\VideoTagsBar.js
import React, { useMemo } from 'react'
import { Box, Chip, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

const normalizeArr = (v) => (Array.isArray(v) ? v : v ? [v] : [])
const toStr = (v) => (v == null ? '' : String(v)).trim()

const getFromMapOrObject = (bucket, key) => {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null
  return null
}

export default function VideoTagsBar({ video, tagsById, iconId = 'tags', maxVisible = 3 }) {
  const tagIds = useMemo(() => {
    const arr = normalizeArr(video?.tagsFull)

    const primitiveIds = arr
      .filter((x) => typeof x === 'string' || typeof x === 'number')
      .map((x) => toStr(x))
      .filter(Boolean)

    if (primitiveIds.length) return primitiveIds

    const objectIds = arr
      .map((t) => toStr(t?.id || t?.tagId))
      .filter(Boolean)

    if (objectIds.length) return objectIds

    return normalizeArr(video?.tagIds).map(toStr).filter(Boolean)
  }, [video?.tagsFull, video?.tagIds])

  const tagLabels = useMemo(() => {
    if (!tagsById) {
      return normalizeArr(video?.tagsFull)
        .map((t) => toStr(t?.tagName || t?.name || t?.label))
        .filter(Boolean)
    }

    return tagIds
      .map((id) => getFromMapOrObject(tagsById, id))
      .map((t) => (typeof t === 'string' ? t : toStr(t?.tagName || t?.name || t?.label)))
      .filter(Boolean)
  }, [tagIds, tagsById, video?.tagsFull])

  if (!tagLabels.length) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 22 }}>
        <Chip
          size="sm"
          variant="outlined"
          startDecorator={iconUi({ id: 'tags', sx: { height: 10, width: 10 } })}
          sx={{ height: 13, fontSize: 8, opacity: 0.6 }}
        >
          ללא תגים
        </Chip>
      </Box>
    )
  }

  const visible = tagLabels.slice(0, maxVisible)
  const hiddenCount = tagLabels.length - visible.length
  const tooltipText = tagLabels.join(' · ')

  return (
    <Tooltip title={tooltipText} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 22 }}>
        {visible.map((label, idx) => (
          <Chip
            key={`${label}-${idx}`}
            size="sm"
            variant="outlined"
            startDecorator={iconUi({ id: iconId, sx: { height: 10, width: 10 } })}
            sx={{
              height: 13,
              fontSize: 8,
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
      </Box>
    </Tooltip>
  )
}
