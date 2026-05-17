// teamProfile/desktop/modules/players/components/sections/PositionsSection.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'

const getPrimaryPosition = (row = {}) => {
  const positions = Array.isArray(row?.positions) ? row.positions : []
  const primary = row?.primaryPosition || row?.generalPosition?.primaryPosition || ''

  return positions.includes(primary) ? primary : ''
}

export default function PositionsSection({
  row,
  onEditPosition,
}) {
  const clickablePositions = typeof onEditPosition === 'function'

  const positions = Array.isArray(row?.positions) ? row.positions : []
  const primaryPosition = getPrimaryPosition(row)

  const visiblePositions = positions.slice(0, 3)
  const restPositions = Math.max(positions.length - visiblePositions.length, 0)

  const generalPositionLabel = row?.generalPosition?.layerLabel || 'ללא עמדה כללית'
  const generalPositionIcon = row?.generalPosition?.layerKey || 'layers'

  return (
    <Box sx={sx.positionsCol}>
      <Box sx={sx.positionsTopRow}>
        {visiblePositions.length ? (
          visiblePositions.map((pos, idx) => {
            const isPrimary = !!primaryPosition && pos === primaryPosition

            return (
              <Chip
                key={`${row?.id}-${pos}-${idx}`}
                size="sm"
                variant={isPrimary ? 'solid' : 'outlined'}
                color={isPrimary ? 'primary' : 'neutral'}
                onClick={clickablePositions ? () => onEditPosition(row) : undefined}
                sx={[
                  clickablePositions ? sx.positionChipClickable : sx.positionChip,
                  isPrimary
                    ? {
                        fontWeight: 700,
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.55)',
                      }
                    : null,
                ]}
              >
                {isPrimary ? `${pos} · ראשית` : pos}
              </Chip>
            )
          })
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
