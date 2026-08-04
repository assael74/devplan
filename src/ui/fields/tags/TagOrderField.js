import * as React from 'react';
import { Input, FormControl, FormLabel } from '@mui/joy';

export default function TagOrderField({
  value,
  onChange,
  label = 'סדר התג',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
  variant = 'plain',
  color = 'neutral'
}) {
  return (
    <FormControl error={error}>
      <FormLabel required={required}> {label} </FormLabel>
      <Input
        placeholder="שם התג"
        value={value}
        size={size}
        color={color}
        type='number'
        autoComplete="off"
        variant={variant}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
