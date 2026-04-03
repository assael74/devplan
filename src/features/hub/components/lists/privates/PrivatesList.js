// src/features/hub/components/lists/privates/PrivatesList.js
import React from 'react'
import { Box, Typography } from '@mui/joy'
import PrivateRow from './PrivateRow.js'

export default function PrivatesList({ players, onSelect, onOpenActions, selectedId }) {
  if (!players?.length) {
    return (
      <Typography level="body-sm" sx={{ p: 1, opacity: 0.7 }}>
        אין שחקנים פרטיים להצגה
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 1, display: 'grid', gap: 0.5 }}>
      {players.map((p) => (
        <PrivateRow
          key={p.id}
          player={p}
          onSelect={onSelect}
          onOpenActions={onOpenActions}
          selected={p.id === selectedId}
        />
      ))}
    </Box>
  )
}
