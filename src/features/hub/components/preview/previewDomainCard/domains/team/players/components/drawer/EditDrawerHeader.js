import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawerHeader({ player }) {
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.playerHeroSx}>
        <Avatar src={player?.photo || playerImage} sx={sx.avatarWrapSx} />
        <Box sx={sx.playerTextSx}>
          <Typography level="title-md" sx={sx.playerNameSx}>
            {player?.name || 'שחקן'}
          </Typography>

          <Typography level="body-xs" sx={sx.playerMetaSx}>
            {player?.teamName || 'שחקן קבוצה'}
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
