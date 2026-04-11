// ui/fields/inputUi/players/PlayerIfaLinkField.js
import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, FormHelperText, Input } from '@mui/joy';

export default function PlayerIfaLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  variant = 'outlined',
  label = 'קישור לאתר ההתאחדות',
}) {

  return (
    <FormControl sx={{ minWidth: 0, width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        type="url"
        size={size}
        value={value}
        autoComplete="off"
        disabled={disabled}
        variant='outlined'
        placeholder="קישור לפרופיל שחקן בהתאחדות"
        startDecorator={iconUi({id: 'addLink', size: size})}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
