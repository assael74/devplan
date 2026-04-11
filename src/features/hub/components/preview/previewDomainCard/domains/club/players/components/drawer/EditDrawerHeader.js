import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawerHeader({ player }) {
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.headerMainSx}>
        <Avatar src={player?.photo || playerImage} sx={{ flexShrink: 0 }} />

        <Box>
          <Typography level="title-md" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {player?.playerFullName || 'עריכת שחקן'}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            {player?.team?.teamName || 'עריכת שחקן'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <ModalClose />
      </Box>
    </DialogTitle>
  )
}
