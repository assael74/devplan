import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function MeetingsCommentsField({
  value,
  size = 'sm',
  onChange,
  label = "",
  required = false,
  error = false,
  disabled = false,
}) {

  return (
    <FormControl>
      <FormLabel required={required} sx={{ fontSize: '12px', alignSelf: 'flex-end' }}> {label} </FormLabel>
      <Input
        variant='outlined'
        placeholder="הערות (לא חובה)"
        value={value || ''}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        error={error}
        size={size}
      />
    </FormControl>
  );
}
