// clubProfile/modules/teams/components/entryDrawer/EditHeaderDrawer.js

import React from 'react'
import { Avatar, Box, Chip, DialogTitle, ModalClose, Typography } from '@mui/joy'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

const c = getEntityColors('teams')

export default function EditHeaderDrawer({
  team,
  club,
  context,
  onClose,
}) {
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: club, subline: club?.clubName, })

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {team?.teamName || team?.name || 'קבוצה'} {team?.teamYear || 'קבוצה'}
          </Typography>

          <Typography
            level="body-sm"
            sx={sx.formNameSx}
            startDecorator={iconUi({ id: 'team' })}
          >
            {team?.club?.clubName}
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
