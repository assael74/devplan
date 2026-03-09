// ui/fields/inputUi/tags/TagNameField.js
import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function TagNameField({
  value,
  onChange,
  label = 'שם התג',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
  placeholder = 'שם התג'
}) {

  return (
    <FormControl error={error}>
      <FormLabel required={required}> {label} </FormLabel>
      <Input
        placeholder={placeholder}
        value={value || ''}
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
