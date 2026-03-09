import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { statsParmTypeFieldOptions } from '../../../x_utils/optionLists.js'

export default function StatsParmTypeFieldSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'סוג שדה',
  size = 'sm',
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        value={value}
        size={size}
        onChange={(_, val) => onChange(val)}
        placeholder='סוג שדה'
        indicator="▼"
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%'
            }
          }
        }}
      >
       {statsParmTypeFieldOptions.map(opt=> {
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
