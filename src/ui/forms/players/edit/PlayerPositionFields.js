// ui/forms/players/edit/PlayerPositionFields.js

import React from 'react'

import PlayerPositionFieldPitch from '../../../fields/players/PlayerPositionsSelect.js'

const cleanPositions = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export default function PlayerPositionFields({
  draft,
  onDraft,
  disabled = false,
  onLimitReached,
}) {
  const handlePositions = (positions) => {
    const nextPositions = cleanPositions(positions)

    onDraft((prev) => {
      const currentPrimary = prev?.primaryPosition || ''
      const primaryPosition = nextPositions.includes(currentPrimary)
        ? currentPrimary
        : ''

      return {
        ...prev,
        positions: nextPositions,
        primaryPosition,
      }
    })
  }

  const handlePrimaryPosition = (primaryPosition) => {
    onDraft((prev) => {
      const positions = cleanPositions(prev?.positions)
      const nextPrimary = positions.includes(primaryPosition)
        ? primaryPosition
        : positions[0] || ''

      return {
        ...prev,
        primaryPosition: nextPrimary,
      }
    })
  }

  return (
    <PlayerPositionFieldPitch
      value={cleanPositions(draft?.positions)}
      primaryPosition={draft?.primaryPosition || ''}
      disabled={disabled}
      onChange={handlePositions}
      onPrimaryPositionChange={handlePrimaryPosition}
      onLimitReached={onLimitReached}
    />
  )
}
