// teamProfile/mobile/modules/abilities/components/inviteDrawer/AbilitiesInviteDrawerHeader.js

import React from 'react'
import { Avatar, Box, DialogTitle, ModalClose, Typography } from '@mui/joy'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export default function AbilitiesInviteDrawerHeader({
  createdState,
  playerName,
  playerPhoto,
}) {
  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar src={playerPhoto} />

        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-lg">
            {createdState ? 'הקישור נוצר בהצלחה' : 'שליחת טופס יכולות'}
          </Typography>

          <Typography level="title-md" sx={{ px: 0.25, fontWeight: 600, textAlign: 'left' }}>
            {playerName}
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            {createdState
              ? 'אפשר לשתף עכשיו את הטופס ישירות בוואטסאפ או להעתיק את הקישור'
              : 'יצירת קישור ציבורי למילוי מהיר מהטלפון'}
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
