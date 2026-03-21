// playerProfile/modules/games/components/entryDrawer/EntryEditHeaderDrawer.js

import React from 'react'
import { Box, Typography, DialogTitle, Avatar, ModalClose } from '@mui/joy'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

const c = getEntityColors('players')

export default function EntryEditHeaderDrawer({ player, game }) {
  const fullName = player?.playerFullName || 'שחקן'
  const rival = game?.rival || game?.game?.rival || '—'
  const dateLabel = game?.dateLabel || game?.dateH || '—'

  return (
    <DialogTitle sx={{ ...sx.dialogTitle, bgcolor: c.bg }}>
      <Box sx={sx.titleWrap}>
        <Box sx={sx.titleMain}>
          <Avatar
            src={player?.photo || playerImage}
            sx={{ width: 42, height: 42, flexShrink: 0, }}
          />

          <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0, }}>
            <Typography level="title-md" sx={sx.formNameSx}>
              עריכת נתוני שחקן במשחק
            </Typography>

            <Typography level="body-sm" sx={{ px: 0.25, textAlign: 'left', opacity: 0.72, }}>
              {[fullName, rival, dateLabel].filter(Boolean).join(' • ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
