// previewDomainCard/domains/player/meetings/components/newVideoForm/NewVideoFormDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/newVideoDrawer.sx.js'

const c = getEntityColors('videoAnalysis')

export default function NewVideoFormDrawerHeader({ draft }) {
  return (
    <DialogTitle sx={{...sx.headerRowSx, bgcolor: c.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'videoAnalysis', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            יצירת וידאו חדש לפגישה
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  )
}
