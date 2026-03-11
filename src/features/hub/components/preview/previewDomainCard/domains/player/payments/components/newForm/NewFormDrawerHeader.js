// previewDomainCard/domains/player/payments/components/newForm/NewFormDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('players')

export default function NewFormDrawerHeader({ draft }) {
  return (
    <DialogTitle sx={{...sx.headerRowSx, bgcolor: c.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'Payments', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            יצירת פגישה חדשה
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  )
}
