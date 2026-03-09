import React from 'react'
import { Box, Chip, ListItem, ListItemButton, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

export default function MeetingRow({ m, active, onSelect, sx }) {
  const date = m?.meetingDate || m?.date || 'ללא תאריך'
  const time = m?.meetingHour || m?.time || ''
  const hasVideo = Boolean(m?.videoId)

  return (
    <ListItem sx={{ p: 0, width: '100%' }}>
      <ListItemButton sx={sx.rowItem(active)} onClick={() => onSelect?.(m)}>
        <Box sx={sx.iconItem}>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            {date} {time ? `· ${time}` : ''}
          </Typography>

          {hasVideo ? iconUi({ id: 'video' }) : null}
        </Box>

        <Box sx={sx.statusItem}>
          {m?.typeLabel ? <Chip size="sm" variant="soft">{m.typeLabel}</Chip> : null}
          {m?.statusLabel ? <Chip size="sm" variant="soft">{m.statusLabel}</Chip> : null}
          {m?.timeLabel ? (
            <Typography level="body-xs" sx={{ opacity: 0.8 }}>{m.timeLabel}</Typography>
          ) : null}
        </Box>
      </ListItemButton>
    </ListItem>
  )
}
