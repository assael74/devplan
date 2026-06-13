// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopMiniCard.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  Checkbox,
  Chip,
  Tooltip,
} from '@mui/joy'
import ImageNotSupportedRounded from '@mui/icons-material/ImageNotSupportedRounded'


import {
  buildVideoCardActions,
  buildVideoCardModel,
} from '../../sharedLogic/index.js'

import VideoDesktopActionsMenu from './VideoDesktopActionsMenu.js'

import { cardSx as sx } from './sx/card.sx.js'

export default function VideoGeneralDesktopMiniCard({
  video,
  onWatch,
  onEdit,
  onShare,
  onDelete,
  tagsById,
  canEdit = true,
  canDelete = true,
  canShare = true,

  selectionMode = false,
  selected = false,
  onToggleSelect,
}) {
  const [imgOk, setImgOk] = useState(true)

  const model = useMemo(
    () =>
      buildVideoCardModel({
        video,
        tagsById,
        tagLimit: 1,
        tagTypeLimit: 1,
      }),
    [video, tagsById]
  )

  const actions = useMemo(
    () =>
      buildVideoCardActions({
        video,
        model,
        onWatch,
        onEdit,
        onShare,
        onDelete,
        canEdit: selectionMode ? false : canEdit,
        canDelete: selectionMode ? false : canDelete,
        canShare: selectionMode ? false : canShare,
      }),
    [
      video,
      model,
      onWatch,
      onEdit,
      onShare,
      onDelete,
      canEdit,
      canDelete,
      canShare,
      selectionMode,
    ]
  )

  const handleCardClick = event => {
    if (!selectionMode) return

    event.preventDefault()
    event.stopPropagation()
    onToggleSelect?.()
  }

  const handleMediaKeyDown = event => {
    if (!actions.canWatch) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      actions.handleWatch()
    }
  }

  return (
    <Card
      size="sm"
      variant="outlined"
      onClick={handleCardClick}
      sx={[
        sx.miniCard({
          tone: model.primaryCategory?.tone,
          status: model.vm.taggingStatus,
        }),
        selectionMode && sx.selectionCard,
        selected && sx.selectedCard,
      ]}
    >
      {selectionMode && (
        <Checkbox
          checked={selected}
          color="danger"
          variant={selected ? 'solid' : 'soft'}
          onClick={event => event.stopPropagation()}
          onChange={() => onToggleSelect?.()}
          sx={sx.selectionCheckbox}
        />
      )}

      <Box
        sx={sx.topAccent({
          tone: model.primaryCategory?.tone,
          status: model.vm.taggingStatus,
        })}
      />

      <Box sx={selectionMode ? sx.selectionContent : undefined}>
        <Box
          sx={sx.miniMedia}
          role={actions.canWatch ? 'button' : undefined}
          tabIndex={actions.canWatch ? 0 : undefined}
          onClick={actions.canWatch ? actions.handleWatch : undefined}
          onKeyDown={handleMediaKeyDown}
        >
          {model.thumb && imgOk ? (
            <Box
              component="img"
              src={model.thumb}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgOk(false)}
              sx={sx.miniImage}
            />
          ) : (
            <Box sx={sx.miniMediaFallback}>
              <ImageNotSupportedRounded />
            </Box>
          )}

          <Tooltip title={model.title} arrow>
            <Box
              component="span"
              sx={sx.miniMediaTitle}
              onClick={actions.canOpenEdit ? actions.handleEdit : undefined}
            >
              {model.title}
            </Box>
          </Tooltip>

          <Chip
            size="sm"
            variant="soft"
            color={model.isMissing || model.isPartial ? 'warning' : 'success'}
            sx={sx.miniStatusChip}
          >
            {model.primaryCategory?.label || model.statusLabel}
          </Chip>
        </Box>

        <Box sx={sx.miniBody}>
          <Box sx={sx.miniMetaRow}>
            <Box component="span" sx={sx.miniDate}>
              {model.updatedLabel || model.dateLabel}
            </Box>

            <VideoDesktopActionsMenu actions={actions} />
          </Box>
        </Box>
      </Box>
    </Card>
  )
}
