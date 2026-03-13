/// ui/fields/inputUi/games/AssistField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function AssistField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  size = 'sm',
  max = 9
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>בישולים</FormLabel>
        <Input
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          placeholder="בישולים"
          type='number'
          autoComplete="off"
          startDecorator={iconUi({id: 'assist', sx: { color: '#6aa84f' }})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="soft"
          size={size}
          slotProps={{ input: { min: 0, max: max } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
