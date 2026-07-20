// features/playersDatabase/components/profilesPage/list/PlayerResultSelectable.js

import React from 'react'

import PlayerResult from './PlayerResult'

export default function PlayerResultSelectable({
  player,
  loading = false,
  selected = false,
  selectionMode,
  onToggleSelect,
  onPreviewSelect
}) {
  const handleClick = event => {
    event?.stopPropagation()

    if (selectionMode) {
      onToggleSelect?.(player)
      return
    }

    onPreviewSelect?.(player)
  }

  return (
    <PlayerResult
      player={player}
      loading={loading}
      selected={selected}
      onClick={handleClick}
    />
  )
}
