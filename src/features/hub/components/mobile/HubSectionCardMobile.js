// features/hub/components/mobile/HubSectionCardMobile.j

import React from 'react'
import { Sheet, Box, Typography, Avatar } from '@mui/joy'

import { hubMobileSx as sx } from './sx/hubMobile.sx'

export default function HubSectionCardMobile({
  tab,
  label,
  icon = null,
  count,
  color,
  onClick,
  avatarSrc,
}) {
  return (
    <Sheet variant="soft" onClick={onClick} sx={sx.cardSheet(color)}>
      <Box sx={sx.card}>
        <Avatar src={avatarSrc} sx={{ border: '1px solid', borderColor: 'divider' }} />

        {typeof count === 'number' ? (
          <Typography level="body-xs" sx={{ color: 'text.tertiary', flexShrink: 0 }}>
            {count}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography level="title-sm" sx={{ lineHeight: 1.25 }}>
          {label}
        </Typography>

        <Typography level="body-xs" sx={{ mt: 0.35, color: 'text.tertiary' }}>
          כניסה לאזור
        </Typography>
      </Box>
    </Sheet>
  )
}
