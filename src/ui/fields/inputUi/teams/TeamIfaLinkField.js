// ui/fields/inputUi/teams/TeamIfaLinkField.js
import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import { FormControl, FormLabel, FormHelperText, Input } from '@mui/joy';

export default function TeamIfaLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  label = 'קישור לאתר ההתאחדות',
}) {

  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        type="url"
        size={size}
        value={value}
        autoComplete="off"
        disabled={disabled}
        placeholder="קישור לפרופיל קבוצה באתר ההתאחדות"
        endDecorator={iconUi({ id: 'addLink', size: size })}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
