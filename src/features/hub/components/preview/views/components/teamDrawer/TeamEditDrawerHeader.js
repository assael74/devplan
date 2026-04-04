// hub/components/preview/views/components/teamDrawer/TeamEditDrawerHeader.js

import React from 'react'
import { Box, Typography, Avatar, DialogTitle, ModalClose, IconButton, Tooltip } from '@mui/joy'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function TeamEditDrawerHeader({ team, pending }) {
  const src = resolveEntityAvatar({
    entityType: 'team',
    team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.headerMainSx}>
        <Avatar src={src} sx={{ flexShrink: 0 }} />

        <Box sx={sx.heroTextSx}>
          <Typography level="title-md" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {team?.teamName || 'עריכת קבוצה'}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            {team?.teamYear ? `שנתון ${team.teamYear}` : 'פרטי קבוצה'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <ModalClose />
      </Box>
    </DialogTitle>
  )
}
