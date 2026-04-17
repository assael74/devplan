// features/hub/components/lists/clubs/ClubsListPane.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubRow from './ClubRow'

export default function ClubsListPane({
  clubs,
  isMobile = false,
  selectedId,
  onSelect,
  onOpenRoute,
  onOpenActions,
}) {
  if (!clubs?.length) {
    return (
      <Typography level="body-sm" sx={{ p: 1, opacity: 0.7 }}>
        אין מועדונים להצגה
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 1, display: 'grid', gap: 0.5 }}>
      {clubs.map((club) => (
        <ClubRow
          key={club.id}
          club={club}
          isMobile={isMobile}
          onSelect={onSelect}
          onOpenRoute={onOpenRoute}
          onOpenActions={onOpenActions}
          selected={club.id === selectedId}
        />
      ))}
    </Box>
  )
}
