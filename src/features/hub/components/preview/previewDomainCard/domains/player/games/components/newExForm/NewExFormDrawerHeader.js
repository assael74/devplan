// previewDomainCard/domains/team/games/components/newExForm/NewExFormDrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle, Avatar } from '@mui/joy'
import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('players')
const p = getEntityColors('private')

export default function NewExFormDrawerHeader({ player }) {
  const fullName = [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ')
  const co = player?.isPrivatePlayer ? p : c

  return (
    <DialogTitle sx={{ ...sx.headerRowSx, bgcolor: co.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        <Avatar src={player?.photo || playerImage} />

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.2 }}>
          <Typography level="title-md" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            יצירת משחק חיצוני חדש
          </Typography>

          {fullName ? (
            <Typography level="body-sm" sx={{ opacity: 0.72 }}>
              {fullName}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </DialogTitle>
  )
}
