// src/ui/fields/players/PlayerLastNameField.js
import React from 'react';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import { iconUi } from '../../core/icons/iconUi.js';

export default function PlayerLastNameField({
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  variant = 'outlined',
  size = 'sm',
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
      <FormLabel sx={{ fontSize: '12px' }}>שם משפחה</FormLabel>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="שם משפחה"
        startDecorator={iconUi({ id: 'player' })}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        variant={variant}
        size={size}
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
