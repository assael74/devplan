// playerProfile/mobile/modules/payments/components/ParentsSection.js

import React from 'react'
import { Box, Card, Typography } from '@mui/joy'

import ParentCard from './cardUi/ParentCard.js'

export default function ParentsSection({ player, onEditParent }) {
  const parents = Array.isArray(player?.parents) ? player.parents : []

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {!parents.length ? (
        <Card variant="outlined" sx={{ p: 1.25 }}>
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
            עדיין לא הוזנו פרטי הורים לשחקן זה.
          </Typography>
        </Card>
      ) : (
        parents.map((parent, index) => (
          <ParentCard
            key={parent?.id || index}
            parent={parent}
            player={player} // <-- הוספת השורה הזו
            onEditParent={onEditParent}
          />
        ))
      )}
    </Box>
  )
}
