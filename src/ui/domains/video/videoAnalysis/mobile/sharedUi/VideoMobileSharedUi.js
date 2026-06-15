// ui/domains/video/videoAnalysis/mobile/sharedUi/VideoMobileSharedUi.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Chip,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../core/icons/iconUi.js'
import {
  getVideoAssignmentIcon,
  getVideoAssignmentText,
} from '../sharedLogic/videoAssignment.utils.js'
import {
  getVideoLink,
} from '../sharedLogic/videoMedia.utils.js'
import {
  getVideoTitle,
  getVideoDateLabel,
  getVideoSummary,
  getVideoTagLabel,
  getVisibleVideoTags,
  getExtraVideoTagsCount,
} from '../sharedLogic/videoDisplay.utils.js'

import { sharedSx as sx } from './shared.ui.sx'

const allTags = video => (Array.isArray(video?.tagsFull) ? video.tagsFull : [])
const shouldShowSummaryMore = summary => String(summary || '').trim().length > 42

export function VideoMobileMedia({ video, onWatch }) {
  const canWatch = !!getVideoLink(video) && typeof onWatch === 'function'
  const title = getVideoTitle(video)
  const dateLabel = getVideoDateLabel(video, '')

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
      <Box sx={sx.analysisPattern} />

      <Typography level="title-sm" sx={sx.analysisCoverTitle}>
        {title}
      </Typography>

      {dateLabel ? (
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: 'calendar', size: 'sm' })}
          sx={sx.analysisDateChip}
        >
          {dateLabel}
        </Chip>
      ) : null}
    </Box>
  )
}

export function VideoMobileInfo({ video }) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const summary = getVideoSummary(video)
  const showMore = shouldShowSummaryMore(summary)
  const assignmentIcon = getVideoAssignmentIcon(video)
  const assignmentText = getVideoAssignmentText(video)

  return (
    <Box sx={sx.infoRoot}>
      <Box sx={sx.contextRow}>
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: assignmentIcon, size: 'sm' })}
          sx={sx.assignmentChip}
        >
          {assignmentText}
        </Chip>
      </Box>

      <Box sx={sx.summaryRow}>
        <Typography level="body-xs" sx={sx.summaryText}>
          {summary}
        </Typography>

        {showMore ? (
          <IconButton
            size="sm"
            variant="plain"
            onClick={(event) => {
              event.stopPropagation()
              setSummaryOpen(true)
            }}
            sx={sx.inlineMoreButton}
          >
            {'\u05e2\u05d5\u05d3'}
          </IconButton>
        ) : null}
      </Box>

      <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <ModalDialog sx={sx.modalDialog}>
          <ModalClose />
          <DialogTitle>{'\u05d4\u05e1\u05d1\u05e8 \u05d4\u05d5\u05d5\u05d9\u05d3\u05d0\u05d5'}</DialogTitle>
          <DialogContent>
            <Typography level="body-sm" sx={sx.modalText}>
              {summary}
            </Typography>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  )
}

export function VideoMobileTags({ video }) {
  const [tagsOpen, setTagsOpen] = useState(false)
  const tags = useMemo(() => allTags(video), [video])
  const visibleTags = useMemo(() => getVisibleVideoTags(video, 2), [video])
  const extraTagsCount = getExtraVideoTagsCount(video, 2)

  const openTags = event => {
    event.stopPropagation()
    setTagsOpen(true)
  }

  return (
    <Box sx={sx.tagsCell}>
      <Box sx={sx.tagsList}>
        {visibleTags.length
          ? visibleTags.map((tag, index) => {
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
            })
          : (
            <Typography level="body-xs" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
              {'\u05dc\u05dc\u05d0 \u05ea\u05d2\u05d9\u05d5\u05ea'}
            </Typography>
          )}
      </Box>

      <IconButton
        size="sm"
        variant="soft"
        color="primary"
        onClick={openTags}
        sx={sx.allTagsButton}
      >
        {extraTagsCount > 0 ? `+${extraTagsCount}` : iconUi({ id: 'tags', sx: { width: 13, height: 13 } })}
      </IconButton>

      <Modal open={tagsOpen} onClose={() => setTagsOpen(false)}>
        <ModalDialog sx={sx.modalDialog}>
          <ModalClose />
          <DialogTitle>{'\u05db\u05dc \u05d4\u05ea\u05d2\u05d9\u05d5\u05ea'}</DialogTitle>
          <DialogContent>
            {tags.length ? (
              <Box sx={sx.tagsModalGrid}>
                {tags.map((tag, index) => {
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
              </Box>
            ) : (
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                {'\u05dc\u05dc\u05d0 \u05ea\u05d2\u05d9\u05d5\u05ea'}
              </Typography>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Box>
  )
}
