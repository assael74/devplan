// src/features/bulkActions/games/delete/components/GamesBulkDeleteStatusChip.js

import React from 'react'
import Chip from '@mui/joy/Chip'

export default function GamesBulkDeleteStatusChip({ game }) {
  const hasStats = Boolean(
    game?.hasStats ||
      game?.statsDocId ||
      game?.statsStatus ||
      game?.gameStatsDocId
  )

  const hasVideo = Boolean(
    game?.videoId ||
      game?.videoUrl ||
      game?.videoLink ||
      game?.hasVideo ||
      game?.videoDocId
  )

  if (hasStats && hasVideo) {
    return (
      <Chip size="sm" color="danger" variant="soft">
        סטטיסטיקה + וידאו
      </Chip>
    )
  }

  if (hasStats) {
    return (
      <Chip size="sm" color="warning" variant="soft">
        סטטיסטיקה
      </Chip>
    )
  }

  if (hasVideo) {
    return (
      <Chip size="sm" color="primary" variant="soft">
        וידאו
      </Chip>
    )
  }

  return (
    <Chip size="sm" color="neutral" variant="soft">
      רגיל
    </Chip>
  )
}
