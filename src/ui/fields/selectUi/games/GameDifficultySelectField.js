/// ui/fields/selectUi/games/GameDifficultySelectField.js

import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { GAME_DIFFICULTY } from '../../../../shared/games/games.constants.js';
import { gameSlot } from '../select.sx.js'

export default function GameDifficultySelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  size = 'sm',
  label = 'רמת קושי'
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        size={size}
        value={value}
        onChange={(_, val) => onChange(val)}
        placeholder='רמת קושי'
        slotProps={gameSlot.listbox}
      >
      {GAME_DIFFICULTY.map(opt=> {
        return (
          <Option key={opt.id} value={opt.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon })}
              {opt.labelH}
            </Stack>
          </Option>
        )
      })}
      </Select>
    </FormControl>
  );
}
