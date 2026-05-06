// ui/patterns/insights/layout/ModeBlockedPlaceholder.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'
import { modalSx as sx } from './sx/modal.sx'

export default function ModeBlockedPlaceholder({
  title = 'לא ניתן להציג נתונים במצב הנוכחי',
  text = 'הנתונים באזור זה דורשים מקור חישוב אחר.',
  icon = 'info',
}) {
  return (
    <Sheet variant="plain" sx={sx.root}>
      <Box sx={sx.icon}>
        {iconUi({ id: icon, size: 'sm' })}
      </Box>

      <Box sx={sx.content}>
        <Typography level="body-sm" sx={sx.title}>
          {title}
        </Typography>

        <Typography level="body-xs" sx={sx.text}>
          {text}
        </Typography>
      </Box>
    </Sheet>
  )
}
