// ui/patterns/insights/InsightsDrawerHeader.js

import React from 'react'
import { Avatar, Box, DialogTitle, ModalClose, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { insightsPatternSx as sx } from './sx/insights.sx.js'

export default function InsightsDrawerHeader({
  title = '',
  subtitle = 'תובנות',
  avatarSrc = '',
  colorSx = {},
  actions = null,
}) {
  return (
    <DialogTitle sx={{ ...sx.headerWrap, ...colorSx }}>
      <Box sx={sx.headerRow}>
        <Avatar src={avatarSrc} />

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {title}
          </Typography>

          <Typography
            level="body-sm"
            sx={sx.formNameSx}
            startDecorator={iconUi({ id: 'insights' })}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mr: 4.5,
          ml: 1,
        }}
      >
        {actions}
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
