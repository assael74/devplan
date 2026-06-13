// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  Checkbox,
} from '@mui/joy'

import {
  buildVideoCardActions,
  buildVideoCardModel,
} from '../../sharedLogic/index.js'

import VideoDesktopCardMedia from './VideoDesktopCardMedia.js'
import VideoDesktopCardBody from './VideoDesktopCardBody.js'

import { cardSx as sx } from './sx/card.sx.js'

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
        tagLimit: 3,
        tagTypeLimit: 2,
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
    onToggleSelect()
  }

  return (
    <Card
      size="sm"
      variant="outlined"
      onClick={handleCardClick}
      sx={[
        sx.card({
          tone: model.primaryCategory?.tone,
          status: model.vm.taggingStatus,
          density,
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
          onChange={() => onToggleSelect()}
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
        <VideoDesktopCardMedia
          model={model}
          actions={actions}
          imgOk={imgOk}
          setImgOk={setImgOk}
        />

        <VideoDesktopCardBody
          model={model}
          actions={actions}
        />
      </Box>
    </Card>
  )
}
