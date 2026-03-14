// previewDomainCard/domains/team/games/components/drawer/EditDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'

import { buildFallbackAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

const c = getEntityColors('teams')

export default function EditDrawerHeader({ game, team }) {
  const src = team?.photo || buildFallbackAvatar({ entityType: 'team', id: team?.id, name: team?.teamName })
  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={sx.heroNameSx}>
             {team?.teamName}
          </Typography>

          <Typography level="body-xs" sx={sx.heroMetaSx} startDecorator={iconUi({ id: 'games' })}>
            {game?.rivel} - {game.gameHour}
          </Typography>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
