// hub/components/preview/views/components/clubDrawer/ClubEditDrawerHeader.js

import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose } from '@mui/joy'

import { buildFallbackAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function ClubEditDrawerHeader({ club }) {
  const src =
    club?.photo ||
    buildFallbackAvatar({
      entityType: 'club',
      id: club?.id,
      name: club?.clubName,
    })

  const subtitle = club?.city || 'עריכת פרטי מועדון'

  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.headerMainSx}>
        <Avatar src={src} sx={{ flexShrink: 0 }} />

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {club?.clubName || 'עריכת מועדון'}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <ModalClose />
      </Box>
    </DialogTitle>
  )
}
