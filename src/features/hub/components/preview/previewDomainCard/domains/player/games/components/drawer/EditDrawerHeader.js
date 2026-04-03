// previewDomainCard/domains/player/games/components/drawer/EditDrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle, Avatar } from '@mui/joy'
import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../../../../../../../shared/format/dateUtiles.js'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('players')

export default function EditDrawerHeader({ player, game }) {
  const fullName = [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ')
  const rival = game?.rival || game?.game?.rivel || '—'
  const dateLabel = getFullDateIl(game?.dateLabel) || getFullDateIl(game?.dateH) || '—'

  return (
    <DialogTitle sx={{ ...sx.headerRowSx, bgcolor: c.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        <Avatar src={player?.photo || playerImage} />

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.2 }}>
          <Typography level="title-md" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            עריכת נתוני שחקן במשחק
          </Typography>

          <Typography level="body-sm" sx={{ opacity: 0.72 }}>
            {[fullName, rival, dateLabel].filter(Boolean).join(' • ')}
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  )
}
