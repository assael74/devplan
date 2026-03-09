import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function VideoCommentsField({
  value,
  size = 'sm',
  onChange,
  label = "",
  required = false,
  error = false,
  disabled = false,
}) {

  return (
    <FormControl error={error}>
      <FormLabel required={required} sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-end' }}> {label} </FormLabel>
      <Input
        variant='outlined'
        placeholder="הערות (לא חובה)"
        value={value || ''}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        error={error}
        size={size}
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
