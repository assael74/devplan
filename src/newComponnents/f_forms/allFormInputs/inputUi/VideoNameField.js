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
      <FormLabel required={required} sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-end' }}> {label} </FormLabel>
      <Input
        placeholder="שם הוידאו"
        value={value || ''}
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        error={error}
        sx={{
          direction: 'rtl',
          textAlign: 'right',
          '& input': {
            direction: 'rtl',
            textAlign: 'right',
          },
          '&:hover': { backgroundColor: '#eef4ff' },
        }}
      />
    </FormControl>
  );
}
