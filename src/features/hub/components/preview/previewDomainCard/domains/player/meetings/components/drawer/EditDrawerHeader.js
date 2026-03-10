// previewDomainCard/domains/player/meetings/components/drawer/EditDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('players')

export default function EditDrawerHeader({ meeting }) {
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'meetings', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            {meeting?.meetingDate || 'פגישה'}
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
