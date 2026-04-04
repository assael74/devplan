/// ui/fields/inputUi/clubs/ClubIfaLinkField.js
import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, FormHelperText, Input } from '@mui/joy';

export default function ClubIfaLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  variant = 'outlined',
  label = 'קישור לאתר ההתאחדות',
}) {

  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        type="url"
        size={size}
        value={value}
        variant={variant}
        autoComplete="off"
        disabled={disabled}
        placeholder="קישור לפרופיל מועדון באתר התאחדות"
        startDecorator={iconUi({id: 'addLink', size: size})}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
