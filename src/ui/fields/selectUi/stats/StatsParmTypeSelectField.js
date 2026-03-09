import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { statsParmOptions } from '../../../../shared/stats/stats.options.js';

export default function StatsParmTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label,
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
        placeholder='סוג פרמטר'
        indicator="▼"
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
            }
          },
          button: {
            sx: {
              fontSize: fontSize,
              fontWeight: '500',
              color: '#333',
            }
          }
        }}
      >
       {statsParmOptions.map(opt=> {
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
