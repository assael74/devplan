// hub/components/lists/players/PlayersList.js
import React from 'react'
import { Box, Typography } from '@mui/joy'
import PlayerRow from './PlayerRow'

export default function PlayersList({ players, onSelect, onOpenActions, selectedId }) {
  if (!players?.length) {
    return <Typography level="body-sm" sx={{ p: 1, opacity: 0.7 }}>אין שחקנים להצגה</Typography>
  }
  return (
    <Box sx={{ p: 1, display: 'grid', gap: 0.5 }}>
      {players.map((p) => (
        <PlayerRow
          key={p.id}
          player={p}
          onSelect={onSelect}
          selected={p.id === selectedId}
        />
      ))}
    </Box>
  )
}
