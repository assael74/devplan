// ui/fields/inputUi/parent/EmailField.js

import * as React from 'react';
import { Input, FormControl, FormLabel } from '@mui/joy';

import { iconUi } from '../../../core/icons/iconUi.js';

export default function EmailField({
  value,
  onChange,
  label = 'דוא"ל',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
  variant = 'outlined',
}) {
  return (
    <FormControl error={error}>
      <FormLabel sx={{ fontSize: '12px' }} required={required}>{label}</FormLabel>
      <Input
        type="email"
        value={value}
        placeholder="you@example.com"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        size={size}
        variant={variant}
        startDecorator={iconUi({id: 'email'})}
      />
    </FormControl>
  );
}
