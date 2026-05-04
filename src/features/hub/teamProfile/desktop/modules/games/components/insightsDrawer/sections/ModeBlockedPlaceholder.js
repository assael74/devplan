import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

const sx = {
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    p: 1.25,
    borderRadius: 14,
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
  },

  icon: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.surface',
    color: 'text.tertiary',
    flexShrink: 0,
  },

  content: {
    minWidth: 0,
    display: 'grid',
    gap: 0.25,
  },

  title: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.35,
  },

  text: {
    color: 'text.tertiary',
    lineHeight: 1.45,
  },
}

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
