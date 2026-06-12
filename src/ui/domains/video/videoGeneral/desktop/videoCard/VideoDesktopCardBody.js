// src/ui/domains/video/videoGeneral/desktop/videoCard/VideoDesktopCardBody.js

import React from 'react'
import { Box, Divider, Tooltip } from '@mui/joy'

import VideoDesktopActionsMenu from './VideoDesktopActionsMenu.js'
import {
  VideoDesktopTagTypesRow,
  VideoDesktopTagsRow,
} from './VideoDesktopCardChips.js'

import { bodySx as sx } from './sx/body.sx.js'

export default function VideoDesktopCardBody({ model, actions }) {
  return (
    <Box sx={sx.body}>
      <Box sx={sx.titleRow}>
        <Tooltip title={`"${model.title}"`} arrow>
          <Box
            component="span"
            sx={sx.titleText}
            onClick={actions.canOpenEdit ? actions.handleEdit : undefined}
          >
            {model.title}
          </Box>
        </Tooltip>
      </Box>

      <Box sx={sx.descriptionRow}>
        {model.description ? (
          <Tooltip title={model.description} arrow>
            <Box component="span" sx={sx.descriptionText}>
              {model.description}
            </Box>
          </Tooltip>
        ) : (
          <Box component="span" sx={sx.descriptionPlaceholder}>
            אין הערות
          </Box>
        )}
      </Box>

      <VideoDesktopTagTypesRow model={model} />

      <VideoDesktopTagsRow model={model} />

      <Divider sx={sx.divider} />

      <Box sx={sx.footerRow}>
        <Box component="span" sx={sx.updatedText}>
          {model.updatedLabel ? `עודכן: ${model.updatedLabel}` : 'ללא תאריך עדכון'}
        </Box>

        <VideoDesktopActionsMenu actions={actions} />
      </Box>
    </Box>
  )
}
