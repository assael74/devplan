// previewDomainCard/domains/team/games/components/newForm/NewFormDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

const c = getEntityColors('teams')

export default function NewFormDrawerHeader({ draft, team }) {
  const src = team?.photo || buildFallbackAvatar({ entityType: 'team', id: team?.id, name: team?.teamName })
  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {team?.teamName}
          </Typography>

          <Typography level="body-xs" sx={sx.formNameSx} startDecorator={iconUi({id: 'addGame'})}>
            יצירת משחק חדש
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  )
}
