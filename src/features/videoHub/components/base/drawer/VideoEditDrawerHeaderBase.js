// videoHub/components/analysis/editDrawer/VideoEditDrawerHeader.js
import React from 'react'
import { Box, Typography, IconButton } from '@mui/joy'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function VideoEditDrawerHeaderBase({ title, onClose, sx }) {
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
