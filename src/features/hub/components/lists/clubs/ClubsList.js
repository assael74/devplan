import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubRow from './ClubRow'

export default function ClubsList({ clubs, onSelect, onOpenActions, selectedId }) {
  if (!clubs?.length) {
    return <Typography level="body-sm" sx={{ p: 1, opacity: 0.7 }}>אין מועדונים להצגה</Typography>
  }
  return (
    <Box sx={{ p: 1, display: 'grid', gap: 0.5 }}>
      {clubs.map((c) => (
        <ClubRow
          key={c.id}
          club={c}
          onSelect={onSelect}
          selected={c.id === selectedId}
        />
      ))}
    </Box>
  )
}
