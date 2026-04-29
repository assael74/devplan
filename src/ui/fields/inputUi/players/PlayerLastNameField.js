/// ui/fields/inputUi/players/PlayerLastNameField.js
import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, FormHelperText } from '@mui/joy';
import Input from '@mui/joy/Input';

export default function PlayerLastNameField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  variant = 'outlined',
  size = 'sm',
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px' }}>שם משפחה</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם משפחה"
          startDecorator={iconUi({id: 'player'})}
          error={error}
          size={size}
          autoComplete="off"
          disabled={disabled}
          variant={variant}
          sx={{ '&:hover': { backgroundColor: '#eef4ff' }}}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>

    </>
  );
}
