import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';

export default function GameDurationSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'זמן משחק',
  size = 'sm',
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        value={value}
        size={size}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר זמן משחק'
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
        <Option value={70}>70 דקות</Option>
        <Option value={80}>80 דקות</Option>
        <Option value={90}>90 דקות</Option>
        <Option value={120}>120 דקות</Option>
      </Select>
    </FormControl>
  );
}
