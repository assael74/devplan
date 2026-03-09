import React, { useState } from 'react';
import { layerBoxProps, chipProps, boxPositionProps } from './X_Style'
import { Box, Typography, Chip, FormControl, FormLabel, Snackbar } from '@mui/joy';

const POSITION_LAYERS = {
  attack: [{ code: 'S', label: 'חלוץ' }],
  atMidfield: [
    { code: 'AL', label: 'כנף שמאל' },
    { code: 'AC', label: 'קשר התקפי' },
    { code: 'AR', label: 'כנף ימין' },
  ],
  midfield: [
    { code: 'MCL', label: 'קשר אמצע שמאל' },
    { code: 'MCR', label: 'קשר אמצע ימין' },
  ],
  dmMid: [
    { code: 'DML', label: 'מגן / כנף שמאל' },
    { code: 'DM', label: 'קשר אחורי' },
    { code: 'DMR', label: 'מגן / כנף ימין' },
  ],

  defense: [
    { code: 'DL', label: 'מגן שמאל' },
    { code: 'DCL', label: 'בלם שמאלי' },
    { code: 'DCR', label: 'בלם ימני' },
    { code: 'DR', label: 'מגן ימין' },
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

export default function PlayerPositionFieldPitch({ value = [], onChange, size = 'sm' }) {
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const MAX_POSITIONS = 4;

  const togglePosition = (code) => {
    const exists = value.includes(code);
    if (exists) {
      onChange(value.filter((p) => p !== code));
    } else if (value.length < MAX_POSITIONS) {
      onChange([...value, code]);
    } else {
      setShowLimitWarning(false);
      setTimeout(() => setShowLimitWarning(true), 50);
    }
  };

  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px', mb: 1 }}>בחר עמדות על המגרש (עד {MAX_POSITIONS})</FormLabel>

      <Box {...boxPositionProps}>
        {POSITION_ORDER.map((layer) => {
          const isFullWidthLayer = ['defense', 'atMidfield', 'dmMid'].includes(layer);
          const title = LAYER_TITLES[layer];

          return (
            <Box key={layer}>
              <Box {...layerBoxProps(isFullWidthLayer)}>
                {POSITION_LAYERS[layer].map(({ code, label }) => (
                  <Chip key={code} onClick={() => togglePosition(code)} {...chipProps(value, code)}>
                    {code}
                  </Chip>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Snackbar
        open={showLimitWarning}
        autoHideDuration={2500}
        onClose={() => setShowLimitWarning(false)}
        color="danger"
        size={size}
        variant="soft"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        ניתן לבחור עד {MAX_POSITIONS} עמדות בלבד
      </Snackbar>
    </FormControl>
  );
}
