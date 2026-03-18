/// ui/fields/selectUi/players/PlayerPositionFieldPitch.js

import React, { useState } from 'react';
import { layerBoxProps, chipProps, boxPositionProps } from './playerPositions.sx'
import { Box, Typography, Chip, FormControl, FormLabel, Snackbar } from '@mui/joy';

const POSITION_LAYERS = {
  attack: [{ code: 'S', label: 'חלוץ' }],
  atMidfield: [
    { code: 'AR', label: 'כנף ימין' },
    { code: 'AC', label: 'קשר התקפי' },
    { code: 'AL', label: 'כנף שמאל' },
  ],
  midfield: [
    { code: 'MCR', label: 'קשר אמצע ימין' },
    { code: 'MCL', label: 'קשר אמצע שמאל' },
  ],
  dmMid: [
    { code: 'DMR', label: 'מגן / כנף ימין' },
    { code: 'DM', label: 'קשר אחורי' },
    { code: 'DML', label: 'מגן / כנף שמאל' },
  ],

  defense: [
    { code: 'DR', label: 'מגן ימין' },
    { code: 'DCR', label: 'בלם ימני' },
    { code: 'DCL', label: 'בלם שמאלי' },
    { code: 'DL', label: 'מגן שמאל' },
  ],
  goalkeeper: [{ code: 'GK', label: 'שוער' }],
};

const POSITION_ORDER = [ 'attack', 'atMidfield', 'midfield', 'dmMid', 'defense', 'goalkeeper',];

const LAYER_TITLES = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קשר אחורי',
  midfield: 'קישור אמצע',
  atMidfield: 'קישור קדמי',
  attack: 'התקפה',
};

export default function PlayerPositionFieldPitch({
  value = [],
  onChange,
  onLimitReached,
  size = 'sm',
}) {
  const MAX_POSITIONS = 4

  const togglePosition = (code) => {
    const exists = value.includes(code)

    if (exists) {
      onChange(value.filter((p) => p !== code))
      return
    }

    if (value.length < MAX_POSITIONS) {
      onChange([...value, code])
      return
    }

    onLimitReached(MAX_POSITIONS)
  }
  //console.log(onLimitReached)
  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px', mb: 1 }}>
        בחר עמדות על המגרש (עד {MAX_POSITIONS})
      </FormLabel>

      <Box {...boxPositionProps}>
        {POSITION_ORDER.map((layer) => {
          const isFullWidthLayer = ['defense', 'atMidfield', 'dmMid'].includes(layer)

          return (
            <Box key={layer}>
              <Box {...layerBoxProps(isFullWidthLayer)}>
                {POSITION_LAYERS[layer].map(({ code }) => (
                  <Chip
                    key={code}
                    onClick={() => togglePosition(code)}
                    {...chipProps(value, code)}
                  >
                    {code}
                  </Chip>
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>
    </FormControl>
  )
}
