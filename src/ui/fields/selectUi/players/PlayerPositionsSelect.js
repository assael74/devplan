// ui/fields/selectUi/players/PlayerPositionsSelect.js

import React from 'react'
import {
  FormControl,
  FormLabel,
} from '@mui/joy'

import {
  MAX_POSITIONS,
  buildAddPositionChange,
  buildPrimaryPositionChange,
  buildRemovePositionChange,
  resolveActivePrimary,
  safeArr,
} from './logic/index.js'

import {
  PositionHelpText,
  PositionPitch,
} from './ui/index.js'

export default function PlayerPositionsSelect({
  value = [],
  primaryPosition = '',
  onChange,
  onPrimaryPositionChange,
  onLimitReached,
  disabled = false,
  size = 'sm',
}) {
  const positions = safeArr(value)

  const activePrimary = resolveActivePrimary({
    positions,
    primaryPosition,
  })

  const emitChange = ({
    nextPositions,
    nextPrimary,
  }) => {
    onChange?.(safeArr(nextPositions))
    onPrimaryPositionChange(nextPrimary || '')
  }

  const handleAddPosition = (code) => {
    const result = buildAddPositionChange({
      positions,
      code,
      primaryPosition,
      max: MAX_POSITIONS,
    })

    if (!result.ok) {
      onLimitReached(MAX_POSITIONS)
      return
    }

    emitChange({
      nextPositions: result.positions,
      nextPrimary: result.primaryPosition,
    })
  }

  const handleRemovePosition = (code) => {
    const result = buildRemovePositionChange({
      positions,
      code,
      primaryPosition,
    })

    emitChange({
      nextPositions: result.positions,
      nextPrimary: result.primaryPosition,
    })
  }

  const handleSetPrimaryPosition = (code) => {
    const nextPrimary = buildPrimaryPositionChange({
      positions,
      code,
    })

    onPrimaryPositionChange?.(nextPrimary)
  }

  const handlePositionClick = (code) => {
    if (disabled) return

    const exists = positions.includes(code)

    if (!exists) {
      handleAddPosition(code)
      return
    }

    handleSetPrimaryPosition(code)
  }

  const hasPositions = positions.length > 0

  return (
    <FormControl disabled={disabled}>
      <FormLabel sx={{ fontSize: '12px', mb: 1 }}>
        בחר עמדות על המגרש (עד {MAX_POSITIONS})
      </FormLabel>

      <PositionHelpText
        hasPositions={hasPositions}
        hasPrimary={!!activePrimary}
      />

      <PositionPitch
        positions={positions}
        activePrimary={activePrimary}
        disabled={disabled}
        onPositionClick={handlePositionClick}
        onPositionRemove={handleRemovePosition}
      />
    </FormControl>
  )
}
