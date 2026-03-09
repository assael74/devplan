/// ui/fields/selectUi/games/GameViewTypeSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { statsViewTypeOptions } from '../../../../shared/stats/stats.options.js'
import { gameSlot } from '../select.sx.js'

export default function GameViewTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = '',
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
        placeholder='בחר תצוגה'
        slotProps={{...gameSlot.listbox, ...gameSlot.button}}
      >
      {statsViewTypeOptions.map(opt=> {
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
