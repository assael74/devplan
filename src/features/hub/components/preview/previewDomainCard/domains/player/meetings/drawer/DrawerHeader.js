// src/features/players/components/preview/PreviewDomainCard/domains/meetings/components/DrawerHeader.js
import React from 'react'
import { Avatar, Box, IconButton, Sheet, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

export default function DrawerHeader({ meta, player, busy, onClose, sx }) {
  const playerName = [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ').trim()

  return (
    <Sheet variant="soft" sx={sx?.root}>
      <Box sx={sx?.row}>
        {/* left spacer */}
        <Box sx={sx?.left} />

        <Box sx={sx?.center} />

        <Box sx={sx?.right}>
          <Box sx={sx?.player}>
            <Box>
              <Typography level="body-sm" sx={sx?.playerName}>
                {playerName}
              </Typography>
              <Typography level="body-sm" sx={sx?.meta}>
                {meta}
              </Typography>
            </Box>
          </Box>

          <Avatar src={player?.photo || ''} size="sm" />

          <IconButton size="sm" variant="soft" onClick={onClose} disabled={busy}>
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>
      </Box>
    </Sheet>
  )
}
