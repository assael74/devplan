// previewDomainCard/domains/team/games/components/newForm/NewFormDrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle } from '@mui/joy'
import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('players')

export default function NewFormDrawerHeader({ player }) {
  const fullName = [player?.playerFirstName, player?.playerLastName].filter(Boolean).join(' ')

  return (
    <DialogTitle sx={{ ...sx.headerRowSx, bgcolor: c.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'games', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            שיוך שחקן למשחק
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
