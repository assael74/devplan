// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  Chip,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import { getDrivePreviewUrl, getDriveThumbUrl } from '../../../../../../shared/media/driveLinks.js'
import {
  getVideoMissingTaggingLabels,
  getVideoTaggingStatusLabel,
  normalizeVideoForUi,
  VIDEO_TAGGING_STATUS,
} from '../../../../../../shared/video/index.js'

import { videoGeneralDesktopCardSx as sx } from './sx/card.sx.js'

const safeArr = value => (Array.isArray(value) ? value : value ? [value] : [])
const safeStr = value => String(value ?? '').trim()

function getFromMapOrObject(bucket, key) {
  if (!bucket || !key) return null
  if (typeof bucket.get === 'function') return bucket.get(key) || null
  if (typeof bucket === 'object') return bucket[key] || null
  return null
}

function getTagLabel(tag) {
  return safeStr(tag?.tagName || tag?.name || tag?.label || tag)
}

function resolveTagLabels(video, tagsById) {
  const tagIds = safeArr(video?.tagIds || video?.tags)
    .map(safeStr)
    .filter(Boolean)

  const fromFull = safeArr(video?.tagsFull)
    .map(getTagLabel)
    .filter(Boolean)

  if (fromFull.length) return fromFull

  return tagIds
    .map(id => getFromMapOrObject(tagsById, id) || id)
    .map(getTagLabel)
    .filter(Boolean)
}

function getThumb(video) {
  if (video?.thumbnailUrl) return video.thumbnailUrl

  const base = getDriveThumbUrl(video?.videoUrl || video?.link || video?.videoLink || '')
  if (!base) return ''

  return base.includes('sz=') ? base : `${base}&sz=w640-h360`
}

function getPreview(video) {
  return getDrivePreviewUrl(video?.videoUrl || video?.link || video?.videoLink || '')
}

function formatDate(value) {
  if (!value) return ''

  const ms =
    typeof value === 'number'
      ? value
      : value?.seconds
      ? value.seconds * 1000
      : typeof value?.toMillis === 'function'
      ? value.toMillis()
      : Number(value)

  if (!Number.isFinite(ms) || !ms) return ''

  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(ms))
  } catch {
    return ''
  }
}

export default function VideoGeneralDesktopCard({
  video,
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
  density = 'compact',
  canEdit = true,
  canDelete = true,
  canShare = true,
}) {
  const [imgOk, setImgOk] = useState(true)

  const vm = useMemo(() => normalizeVideoForUi(video), [video])
  const tagLabels = useMemo(() => resolveTagLabels(vm, tagsById), [vm, tagsById])
  const thumb = useMemo(() => getThumb(vm), [vm])
  const preview = useMemo(() => getPreview(vm), [vm])

  const canWatch = Boolean(preview) && typeof onWatch === 'function'
  const canOpenEdit = canEdit && typeof onEdit === 'function'
  const canOpenShare = canShare && typeof onShare === 'function'
  const canRemove = canDelete && typeof onDelete === 'function'

  const isMissing = vm.taggingStatus === VIDEO_TAGGING_STATUS.NEEDS_TAGGING
  const isPartial = vm.taggingStatus === VIDEO_TAGGING_STATUS.PARTIAL

  const statusLabel = getVideoTaggingStatusLabel(vm.taggingStatus)
  const missingLabels = getVideoMissingTaggingLabels(vm)
  const visibleTags = tagLabels.slice(0, 3)
  const hiddenTagsCount = tagLabels.length - visibleTags.length
  const updatedLabel = formatDate(vm.updatedAt || vm.createdAt)

  return (
    <Card
      size="sm"
      variant="outlined"
      sx={sx.card({
        tone: vm.primaryCategory?.tone,
        status: vm.taggingStatus,
        density,
      })}
    >
      <Box sx={sx.topAccent({ tone: vm.primaryCategory?.tone, status: vm.taggingStatus })} />

      <Box
        sx={sx.media}
        role={canWatch ? 'button' : undefined}
        tabIndex={canWatch ? 0 : undefined}
        onClick={canWatch ? () => onWatch(video) : undefined}
        onKeyDown={
          canWatch
            ? event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onWatch(video)
                }
              }
            : undefined
        }
      >
        {thumb && imgOk ? (
          <Box
            component="img"
            src={thumb}
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

        {canWatch ? (
          <Box sx={sx.playBadge}>
            {iconUi({ id: 'playVideo', size: 'sm' })}
          </Box>
        ) : null}

        {isMissing || isPartial ? (
          <Chip size="sm" variant="soft" color="warning" sx={sx.mediaStatusChip}>
            {statusLabel}
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.body}>
        <Box sx={sx.metaRow}>
          {vm.primaryCategory ? (
            <Chip
              size="sm"
              variant="soft"
              sx={sx.categoryChip({ tone: vm.primaryCategory.tone })}
              startDecorator={iconUi({ id: vm.primaryCategory.iconId, size: 'xs' })}
            >
              {vm.primaryCategory.label}
            </Chip>
          ) : (
            <Chip size="sm" variant="soft" color="warning" sx={sx.categoryMissingChip}>
              ללא קטגוריה
            </Chip>
          )}

          <Chip
            size="sm"
            variant="outlined"
            color={isMissing || isPartial ? 'warning' : 'success'}
            sx={sx.statusChip}
          >
            {statusLabel}
          </Chip>
        </Box>

        <Tooltip title={vm.title} arrow>
          <Typography
            level="title-sm"
            noWrap
            sx={sx.title}
            onClick={canOpenEdit ? () => onEdit(video) : undefined}
          >
            {vm.title}
          </Typography>
        </Tooltip>

        <Tooltip title={vm.description || 'ללא תיאור'} arrow>
          <Typography level="body-xs" sx={sx.description}>
            {vm.description || 'ללא תיאור'}
          </Typography>
        </Tooltip>

        <Box sx={sx.tagsRow}>
          {visibleTags.length ? (
            visibleTags.map((label, index) => (
              <Chip key={`${label}-${index}`} size="sm" variant="outlined" sx={sx.tagChip}>
                #{label}
              </Chip>
            ))
          ) : (
            <Chip size="sm" variant="outlined" color="warning" sx={sx.emptyTagChip}>
              ללא תגיות
            </Chip>
          )}

          {hiddenTagsCount > 0 ? (
            <Tooltip title={tagLabels.join(' · ')} arrow>
              <Chip size="sm" variant="soft" sx={sx.moreChip}>
                +{hiddenTagsCount}
              </Chip>
            </Tooltip>
          ) : null}
        </Box>

        {missingLabels.length ? (
          <Box sx={sx.missingRow}>
            {missingLabels.map(label => (
              <Chip key={label} size="sm" variant="soft" color="warning" sx={sx.missingChip}>
                {label}
              </Chip>
            ))}
          </Box>
        ) : null}

        <Divider sx={sx.divider} />

        <Box sx={sx.footerRow}>
          <Typography level="body-xs" sx={sx.updatedText}>
            {updatedLabel ? `עודכן: ${updatedLabel}` : 'ללא תאריך עדכון'}
          </Typography>

          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  size: 'sm',
                  variant: 'plain',
                  sx: sx.moreButton,
                },
              }}
            >
              {iconUi({ id: 'more' })}
            </MenuButton>

            <Menu size="sm" placement="bottom-end">
              {canWatch ? (
                <MenuItem onClick={() => onWatch(video)}>
                  {iconUi({ id: 'playVideo', size: 'sm' })}
                  צפייה
                </MenuItem>
              ) : null}

              {canOpenEdit ? (
                <MenuItem onClick={() => onEdit(video)}>
                  {iconUi({ id: 'edit', size: 'sm' })}
                  {isMissing || isPartial ? 'אפיין וידאו' : 'עריכה'}
                </MenuItem>
              ) : null}

              {canOpenShare ? (
                <MenuItem onClick={() => onShare(video)}>
                  {iconUi({ id: 'share', size: 'sm' })}
                  שיתוף
                </MenuItem>
              ) : null}

              {canRemove ? (
                <MenuItem color="danger" onClick={() => onDelete(video)}>
                  {iconUi({ id: 'delete', size: 'sm' })}
                  מחיקה
                </MenuItem>
              ) : null}
            </Menu>
          </Dropdown>
        </Box>
      </Box>
    </Card>
  )
}
