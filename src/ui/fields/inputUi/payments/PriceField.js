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
        value={value}
        type="number"
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="0 הכנס סכום"
        startDecorator="₪"
        min={0}
        step={1}
        disabled={disabled}
      />
    </FormControl>
  );
}
