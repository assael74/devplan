// videoHub/components/analysis/attachDrawer/VideoAttachDrawerHeader.js
import React from 'react'
import { Box, Typography, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { videoAttachDrawerSx as sx } from '../sx/videoAttachDrawer.sx'

export default function VideoAttachDrawerHeader({ title, onClose }) {
  return (
    <Box sx={sx.header}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
        <Typography level="title-sm" noWrap sx={sx.cardTitle}>{title}</Typography>
      </Box>

      <IconButton size="sm" variant="plain" onClick={onClose}>
        {iconUi({ id: 'close' })}
      </IconButton>
    </Box>
  )
}
