// C:\projects\devplan\src\ui\fields\inputUi\trainings\DurationField.js
import * as React from 'react';
import { Box, Typography, Input, FormLabel, FormControl } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';

export default function DurationField({
  value,
  onChange,
  label = 'זמן',
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
        onChange={(e) => onChange(e.target.value)}
        placeholder='זמן אימון'
        startDecorator={iconUi({id: 'duration'})}
        min={0}
        step={1}
        disabled={disabled}
      />
    </FormControl>
  );
}
