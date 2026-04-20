import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function PriceField({
  value,
  onChange,
  label = 'סכום לתשלום',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
}) {

  return (
    <FormControl error={error}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}> {label} </FormLabel>
      <Input
        value={value ?? 0}
        type="number"
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        placeholder="0 הכנס סכום"
        startDecorator="₪"
        slotProps={{ input: { min: 0, max: 20 } }}
        step={1}
        disabled={disabled}
      />
    </FormControl>
  );
}
