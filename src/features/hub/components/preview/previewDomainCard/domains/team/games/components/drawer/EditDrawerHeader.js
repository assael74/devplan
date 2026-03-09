// previewDomainCard/domains/team/games/components/drawer/EditDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('teams')

export default function EditDrawerHeader({ game }) {
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.heroSx}>
        {iconUi({ id: 'games', size: 'lg', sx: { color: c.accent, ml: 1.5 } })}

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
            {game?.rivel || 'משחק'}
          </Typography>

          <Typography level="body-xs" sx={sx.heroMetaSx}>
            {game?.dateLabel} - {game.gameHour}
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
