// previewDomainCard/domains/team/videos/components/newForm/NewFormDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle, ModalClose } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('videoAnalysis')

export default function NewFormDrawerHeader({ draft }) {
  return (
    <DialogTitle sx={{...sx.headerRowSx, height: 50, mb: 3, bgcolor: c.bg, borderRadius: 'sm', p: 2 }}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'video', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            יצירת וידאו חדש
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
