// ui/fields/selectUi/players/ui/PositionPitch.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  FULL_WIDTH_LAYERS,
  POSITION_LAYERS,
  POSITION_ORDER,
} from '../../../../../shared/players/index.js'

import {
  getPositionMode,
} from '../logic/index.js'

import PositionChip from './PositionChip.js'

import { sx } from '../sx/playerPositions.sx.js'

export default function PositionPitch({
  positions = [],
  activePrimary = '',
  disabled = false,
  onPositionClick,
  onPositionRemove,
}) {
  return (
    <Box sx={sx.pitch}>
      {POSITION_ORDER.map((layer) => {
        const isFullWidthLayer = FULL_WIDTH_LAYERS.includes(layer)

        return (
          <Box key={layer}>
            <Box sx={sx.layer(isFullWidthLayer)}>
              {(POSITION_LAYERS[layer] || []).map(({ code }) => {
                const mode = getPositionMode({
                  positions,
                  code,
                  activePrimary,
                })

                const selected = mode !== 'idle'
                const isPrimary = mode === 'primary'

                return (
                  <PositionChip
                    key={code}
                    code={code}
                    selected={selected}
                    isPrimary={isPrimary}
                    disabled={disabled}
                    onClick={() => onPositionClick(code)}
                    onRemove={(event) => {
                      event?.stopPropagation()
                      onPositionRemove(code)
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
