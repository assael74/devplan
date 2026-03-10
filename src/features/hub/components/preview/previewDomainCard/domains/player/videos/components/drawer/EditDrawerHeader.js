// previewDomainCard/domains/Player/videos/components/drawer/EditDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle, ModalClose } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('videoAnalysis')

export default function EditDrawerHeader({ video }) {
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'video', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            {video?.name || 'וידאו'}
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            עריכה מהירה לוידאו
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
