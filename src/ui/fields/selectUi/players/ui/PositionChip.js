// ui/fields/selectUi/players/ui/PositionChip.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { sx } from '../sx/playerPositions.sx.js'

const getVariant = (selected) => {
  return selected ? 'solid' : 'soft'
}

const getColor = ({
  selected,
  isPrimary,
}) => {
  if (isPrimary) return 'primary'
  if (selected) return 'success'

  return 'neutral'
}

const getSubLabel = ({
  selected,
  isPrimary,
}) => {
  if (isPrimary) return 'ראשית'
  if (selected) return 'משנית'

  return ''
}

export default function PositionChip({
  code,
  selected,
  isPrimary,
  disabled,
  onClick,
  onRemove,
}) {
  const subLabel = getSubLabel({
    selected,
    isPrimary,
  })

  return (
    <Chip
      onClick={disabled ? undefined : onClick}
      variant={getVariant(selected)}
      color={getColor({
        selected,
        isPrimary,
      })}
      size="lg"
      sx={sx.chip({
        selected,
        isPrimary,
        disabled,
      })}
    >
      <Box sx={sx.chipContent}>
        <Typography level="body-sm" sx={sx.chipCode}>
          {code}
        </Typography>

        {subLabel ? (
          <Typography
            className="position-chip-sub"
            level="body-xs"
            sx={sx.chipSub}
          >
            {subLabel}
          </Typography>
        ) : null}
      </Box>

      {selected && !disabled ? (
        <Box
          component="span"
          onClick={onRemove}
          sx={sx.remove}
        >
          ×
        </Box>
      ) : null}
    </Chip>
  )
}
