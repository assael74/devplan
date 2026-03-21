import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import { VideoPreviewMedia } from '../../../../../../../ui/domains/video/videoAnalysis'
import { compactMediaSx } from '../../../../../../../ui/domains/video/videoAnalysis/sx/videoPreviewMedia.sx.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../shared/format/dateUtiles.js'
import { playerVideosSectionsSx as sx } from '../../sx/playerVideos.sections.sx.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('videoAnalysis')

const safe = (v) => (v == null ? '' : String(v))

const getMonthYear = (dateStr) => {
  if (!dateStr) return ''
  const [, mm, yyyy] = dateStr.split('-')
  return `${mm}-${yyyy}`
}

const getAssignmentType = (video) =>
  safe(video?.assignmentType || '').trim().toLowerCase()

const getAssignmentText = (video) =>
  safe(video?.assignmentText || 'ניתוח שחקן')

const getTagLabel = (tag) =>
  safe(tag?.tagName || tag?.label || tag?.name || 'תג')

const getNotes = (video) => safe(video?.notes || '')

/* ---------------- MEDIA ---------------- */

export function MediaSection({ video, onWatch }) {
  const handleWatch = () => {
    if (onWatch) onWatch(video)
  }

  return (
    <Box sx={sx.mediaCellSx}>
      <VideoPreviewMedia
        video={video}
        sx={compactMediaSx}
        showMenu={false}
        showWatch={false}
        clickable
        onWatch={handleWatch}
      />
    </Box>
  )
}

/* ---------------- INFO ---------------- */

export function InfoSection({ video }) {
  const title = video?.name || 'קטע וידאו'
  return (
    <Box sx={sx.infoCellSx}>
      <Typography level="title-sm" sx={sx.titleSx} title={title}>
        {title}
      </Typography>

      <Box sx={sx.infoMetaRowSx}>
        <Box sx={sx.metaItemSx}>
          {iconUi({ id: 'calendar', size: 'sm' })}
        </Box>
      </Box>
    </Box>
  )
}

/* ---------------- ASSIGNMENTS ---------------- */

export function AssignmentSection({ video }) {
  const assignmentType = getAssignmentType(video)
  const assignmentText = getAssignmentText(video)
  const monthText = getMonthYear(getFullDateIl(video?.monthKey))
  const iconId = assignmentType === 'meeting' ? 'meeting' : 'videoAnalysis'

  return (
    <Box sx={sx.assignmentCellSx}>
      <Box sx={sx.assignmentIconWrapSx}>
        {iconUi({ id: iconId, sx: {color: c.textAcc} })}
      </Box>

      <Box sx={{ display: 'flex', justifyItems: 'center', alignItems: 'center', gap: 1 }}>
        <Typography level="body-sm" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: 11 }}>
          {assignmentText}
        </Typography>

        <Typography level="body-sm" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: 11 }}>
          {monthText}
        </Typography>
      </Box>
    </Box>
  )
}

/* ---------------- TAGS ---------------- */

export function TagsSection({ video }) {
  const tagsFull = Array.isArray(video?.tagsFull) ? video.tagsFull : []

  const visibleTags = useMemo(() => tagsFull.slice(0, 6), [tagsFull])
  const extraTagsCount = Math.max(tagsFull.length - visibleTags.length, 0)

  if (!visibleTags.length) {
    return (
      <Box sx={sx.tagsCellSx}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic', }}>
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
              variant="outlined"
              startDecorator={iconUi({id: 'children'})}
              sx={sx.tagChipSx}
            >
              {label}
            </Chip>
          )
        })}

        {extraTagsCount > 0 ? (
          <Chip size="sm" variant="plain" color="neutral" sx={{fontWeight: 700,}}>
            +{extraTagsCount}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}

/* ---------------- NOTES ---------------- */

export function NotesSection({ video, onOpenNotes }) {
  const notes = getNotes(video)
  const hasNotes = notes.trim().length > 0

  const notesPreview = useMemo(() => {
    if (!hasNotes) return 'ללא הערות'
    return notes
  }, [hasNotes, notes])

  const handleOpenNotes = () => {
    if (onOpenNotes) onOpenNotes(video)
  }

  return (
    <Box sx={sx.notesCellSx}>
      <Typography
        level="body-sm"
        sx={sx.notesTextSx(hasNotes)}
        title={hasNotes ? notes : 'ללא הערות'}
      >
        {notesPreview}
      </Typography>

      {hasNotes ? (
        <Box
          component="button"
          type="button"
          onClick={handleOpenNotes}
          sx={sx.moreNotesBtnSx}
        >
          עוד...
        </Box>
      ) : null}
    </Box>
  )
}
