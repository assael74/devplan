// src/ui/fields/players/PlayerShortNameField.js
import React from 'react';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { iconUi } from '../../core/icons/iconUi.js';

export default function PlayerShortNameField({
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  size = 'sm',
  variant = 'outlined',
  sx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={{ width: '100%' }}
    >
      <FormLabel sx={{ fontSize: '12px' }}>כינוי</FormLabel>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="כינוי שחקן"
        startDecorator={iconUi({ id: 'shortName' })}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        variant={variant}
        slotProps={slotProps}
        sx={{
          '&:hover': { backgroundColor: '#eef4ff' },
          ...sx,
        }}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
