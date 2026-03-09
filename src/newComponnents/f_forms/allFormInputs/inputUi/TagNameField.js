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
}) {

  return (
    <FormControl error={error}>
      <FormLabel required={required}> {label} </FormLabel>
      <Input
        placeholder="שם התג"
        value={value || ''}
        size={size}
        autoComplete="off"
        sx={{
          direction: 'rtl',
          textAlign: 'right',
          '& input': {
            direction: 'rtl',
            textAlign: 'right',
          },
          '&:hover': { backgroundColor: '#eef4ff' },
        }}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
