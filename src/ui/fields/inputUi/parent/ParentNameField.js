// ui/fields/inputUi/parent/ParentNameField.js

import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function ParentNameField({
  value,
  onChange,
  disabled,
  size = 'sm',
  label = 'שם ההורה',
  variant = 'outlined',
}) {
  return (
    <>
      <FormControl sx={{ minWidth: 0, width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-start' }}>{label}</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם ההורה"
          size={size}
          autoComplete="off"
          startDecorator={iconUi({id: 'parent'})}
          disabled={disabled}
          variant={variant}
          sx={{ '&:hover': { backgroundColor: '#eef4ff' }}}
        />
      </FormControl>

    </>
  );
}
