// teamProfile/modules/players/components/sections/PositionsSection.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { teamPlayersSectionsSx as sx } from '../../sx/teamPlayers.sections.sx.js'

export default function PositionsSection({
  row,
  onEditPosition,
}) {
  const clickablePositions = typeof onEditPosition === 'function'

  const visiblePositions = Array.isArray(row?.positions) ? row.positions.slice(0, 3) : []
  const restPositions = Math.max((row?.positions?.length || 0) - visiblePositions.length, 0)
  const generalPositionLabel = row?.generalPosition?.layerLabel || 'ללא עמדה כללית'
  const generalPositionIcon = row?.generalPosition?.layerKey || 'layers'

  return (
    <Box sx={sx.positionsCol}>
      <Box sx={sx.positionsTopRow}>
        {visiblePositions.length ? (
          visiblePositions.map((pos, idx) => (
            <Chip
              key={`${row?.id}-${pos}-${idx}`}
              size="sm"
              variant={idx === 0 ? 'soft' : 'outlined'}
              color={idx === 0 ? 'primary' : 'neutral'}
              onClick={clickablePositions ? () => onEditPosition(row) : undefined}
              sx={clickablePositions ? sx.positionChipClickable : sx.positionChip}
            >
              {pos}
            </Chip>
          ))
        ) : (
          <Chip
            size="sm"
            variant="outlined"
            color="danger"
            onClick={clickablePositions ? () => onEditPosition(row) : undefined}
            sx={clickablePositions ? sx.positionChipClickable : sx.positionChip}
          >
            ללא עמדה
          </Chip>
        )}

        {restPositions > 0 ? (
          <Chip
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={clickablePositions ? () => onEditPosition(row) : undefined}
            sx={clickablePositions ? sx.positionChipClickable : sx.positionChip}
          >
            +{restPositions}
          </Chip>
        ) : null}
      </Box>

      <Box sx={sx.positionsBottomRow}>
        {visiblePositions.length > 0 ? (
          <Chip
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={iconUi({ id: generalPositionIcon })}
            onClick={clickablePositions ? () => onEditPosition(row) : undefined}
            sx={clickablePositions ? sx.generalPositionChipClickable : sx.generalPositionChip}
          >
            {generalPositionLabel}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
