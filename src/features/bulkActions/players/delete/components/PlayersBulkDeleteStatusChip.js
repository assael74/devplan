// src/features/bulkActions/players/delete/components/PlayersBulkDeleteStatusChip.js

import React from 'react'
import Chip from '@mui/joy/Chip'

function getPlayerData(player = {}) {
  return player?.player || player
}

export default function PlayersBulkDeleteStatusChip({ player }) {
  const data = getPlayerData(player)

  const hasPhoto = Boolean(data?.photo)

  const hasAbilities = Boolean(
    data?.abilities ||
    data?.formIds?.length ||
    data?.level ||
    data?.levelPotential
  )

  const hasStats = Boolean(
    data?.stats ||
    data?.hasStats ||
    data?.gamesCount ||
    data?.minutes
  )

  if (hasStats && hasAbilities) {
    return (
      <Chip size="sm" color="danger" variant="soft">
        ביצועים + יכולות
      </Chip>
    )
  }

  if (hasStats) {
    return (
      <Chip size="sm" color="warning" variant="soft">
        נתוני ביצוע
      </Chip>
    )
  }

  if (hasAbilities) {
    return (
      <Chip size="sm" color="primary" variant="soft">
        נתוני יכולות
      </Chip>
    )
  }

  if (hasPhoto) {
    return (
      <Chip size="sm" color="neutral" variant="soft">
        כולל תמונה
      </Chip>
    )
  }

  return (
    <Chip size="sm" color="neutral" variant="soft">
      רגיל
    </Chip>
  )
}
