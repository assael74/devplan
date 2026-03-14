// previewDomainCard/domains/team/videos/components/newForm/NewFormDrawerHeader.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'
import React from 'react'
import { Box, Typography, DialogTitle, ModalClose, Avatar } from '@mui/joy'

import { buildFallbackAvatar } from '../../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

const c = getEntityColors('videoAnalysis')

export default function NewFormDrawerHeader({ draft, team }) {
  const src = team?.photo || buildFallbackAvatar({ entityType: 'team', id: team?.id, name: team?.teamName })
  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {team?.teamName}
          </Typography>

          <Typography level="body-xs" sx={sx.formNameSx} startDecorator={iconUi({id: 'addVideo'})}>
            קישור וידאו לקבוצה
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  )
}
