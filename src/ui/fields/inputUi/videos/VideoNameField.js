import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function VideoNameField({
  value,
  onChange,
  size = 'sm',
  label = 'שם קטע הוידאו',
  required = false,
  error = false,
  disabled = false,
}) {

  return (
    <FormControl error={error}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}> {label} </FormLabel>
      <Input
        placeholder="שם הוידאו"
        value={value || ''}
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        error={error}
        sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
        slotProps={{
          input: { maxLength: 20, },
        }}
      />
    </FormControl>
  );
}
