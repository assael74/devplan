/// ui/fields/selectUi/games/GameTypeSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { GAME_TYPE } from '../../../../shared/games/games.constants.js';
import { gameSlot } from '../select.sx.js'

export default function GameTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'סוג משחק',
  size = 'sm',
}) {
  const fontSize = size === 'sm' ? '0.775rem' : '0.975rem'
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        value={value}
        size={size}
        onChange={(_, val) => onChange(val)}
        placeholder='סוג משחק'
        slotProps={{...gameSlot.listbox, ...gameSlot.button}}
      >
      {GAME_TYPE.map(opt=> {
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
