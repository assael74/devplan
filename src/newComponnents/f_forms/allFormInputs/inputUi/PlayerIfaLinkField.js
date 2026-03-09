import React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { FormControl, FormLabel, FormHelperText, Input } from '@mui/joy';

export default function PlayerIfaLinkField({
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
        placeholder="קישור לפרופיל שחקן בהתאחדות"
        startDecorator={iconUi({id: 'addLink', size: size})}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
