// clubProfile/desktop/modules/players/components/sections/PositionsSection.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  buildPositionsSectionModel,
} from './ui/positionsSection.ui.js'

import { positionSx as sx } from './sx/position.sx.js'

export default function PositionsSection({ row, onEditPosition }) {
  const clickable = typeof onEditPosition === 'function'
  const handleClick = clickable ? () => onEditPosition(row) : undefined

  const {
    mainPosition,
    extraCount,
    generalPositionLabel,
    generalPositionIcon,
    isPrimary,
    isEmpty,
  } = buildPositionsSectionModel(row)

  const chipSx = clickable ? sx.chipClickable : sx.chip
  const generalChipSx = clickable ? sx.generalChipClickable : sx.generalChip

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
          color={isPrimary ? 'primary' : 'neutral'}
          startDecorator={iconUi({ id: mainPosition, size: 'xs' })}
          onClick={handleClick}
          sx={[
            chipSx,
            sx.mainChip,
            isPrimary ? sx.primaryChip : sx.secondaryMainChip,
          ]}
        >
          {mainPosition}
        </Chip>

        {extraCount > 0 ? (
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

      {generalPositionLabel ? (
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
