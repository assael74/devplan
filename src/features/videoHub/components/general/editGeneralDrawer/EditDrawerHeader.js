// videoHub/components/analysis/editDrawer/EditDrawerHeader.js

import React from 'react'
import { Box, Typography, ModalClose, DialogTitle } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import { editDrawerSx as sx } from './sx/editDrawer.sx'

const c = getEntityColors('videoGeneral')

export default function EditDrawerHeader({ title, onClose }) {
  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm', height: 50 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, pl: 2, pt: 0.5 }}>
        <Typography level="title-sm" noWrap sx={{ lineHeight: 1.1, maxWidth: '100%' }}>
           עריכת וידאו: "{title}"
        </Typography>
      </Box>

      <ModalClose  />
    </DialogTitle>
  )
}
