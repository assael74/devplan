import * as React from 'react';
import { Input, FormControl, FormLabel } from '@mui/joy';

export default function EmailField({
  value,
  onChange,
  label = 'דוא"ל',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
}) {
  return (
    <FormControl error={error}>
      <FormLabel required={required}>{label}</FormLabel>
      <Input
        type="email"
        value={value}
        placeholder="you@example.com"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        size={size}
        variant="soft"
      />
    </FormControl>
  );
}
