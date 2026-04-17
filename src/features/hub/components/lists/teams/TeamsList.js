// features/hub/components/lists/teams/TeamsList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamRow from './TeamRow'

export default function TeamsList({
  teams,
  isMobile,
  onSelect,
  selectedId,
  onOpenRoute,
  onOpenActions,
}) {
  if (!teams?.length) {
    return <Typography level="body-sm" sx={{ p: 1.5, opacity: 0.7 }}>אין קבוצות להצגה</Typography>
  }
  return (
    <Box sx={{ p: 1, display: 'grid', gap: 0.5 }}>
      {teams.map((t) => (
        <TeamRow
          key={t.id}
          team={t}
          isMobile={isMobile}
          onSelect={onSelect}
          onOpenRoute={onOpenRoute}
          selected={t.id === selectedId}
          onOpenActions={onOpenActions}
        />
      ))}
    </Box>
  )
}
