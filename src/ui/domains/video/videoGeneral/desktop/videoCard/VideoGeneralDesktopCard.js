// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoGeneralDesktopCard.js

import React, { useMemo, useState } from 'react'
import { Box, Card } from '@mui/joy'

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
        canEdit,
        canDelete,
        canShare,
      }),
    [video, model, onWatch, onEdit, onShare, onDelete, canEdit, canDelete, canShare]
  )

  return (
    <Card
      size="sm"
      variant="outlined"
      sx={sx.card({
        tone: model.primaryCategory?.tone,
        status: model.vm.taggingStatus,
        density,
      })}
    >
      <Box
        sx={sx.topAccent({
          tone: model.primaryCategory?.tone,
          status: model.vm.taggingStatus,
        })}
      />

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
    </Card>
  )
}
