// teamProfile/desktop/modules/players/components/sections/PositionsCell.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { positionSx as sx } from './sx/position.sx.js'

import {
  buildPositionsCellModel,
} from './ui/positionsCell.ui.js'

export default function PositionsCell({
  row,
  compact = false,
  onEditPosition,
}) {
  const clickablePositions = typeof onEditPosition === 'function'
  const handleClick = clickablePositions ? () => onEditPosition(row) : undefined

  const {
    mainPosition,
    extraCount,
    generalPositionLabel,
    generalPositionIcon,
    isEmpty,
  } = buildPositionsCellModel(row)

  const chipSx = clickablePositions ? sx.chipClickable : sx.chip
  const generalChipSx = clickablePositions ? sx.generalChipClickable : sx.generalChip

  if (isEmpty) {
    return (
      <Box sx={sx.col}>
        <Chip
          size="sm"
          variant="outlined"
          color="danger"
          startDecorator={iconUi({ id: 'position', size: 'xs' })}
          onClick={handleClick}
          sx={chipSx}
        >
          ללא עמדה
        </Chip>
      </Box>
    )
  }

  return (
    <Box sx={sx.col}>
      <Box sx={sx.topRow}>
        <Chip
          size="sm"
          variant="solid"
          color="primary"
          startDecorator={iconUi({ id: mainPosition, size: 'xs' })}
          onClick={handleClick}
          sx={[chipSx, sx.primaryChip]}
        >
          {mainPosition}
        </Chip>

        {!compact && extraCount > 0 ? (
          <Chip
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={handleClick}
            sx={chipSx}
          >
            +{extraCount}
          </Chip>
        ) : null}
      </Box>

      {!compact && generalPositionLabel ? (
        <Box sx={sx.bottomRow}>
          <Chip
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={iconUi({ id: generalPositionIcon, size: 'xs' })}
            onClick={handleClick}
            sx={generalChipSx}
          >
            {generalPositionLabel}
          </Chip>
        </Box>
      ) : null}
    </Box>
  )
}
