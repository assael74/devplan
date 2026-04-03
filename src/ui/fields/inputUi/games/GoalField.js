/// ui/fields/inputUi/games/GoalsForField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GoalField({
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
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שערים</FormLabel>
        <Input
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שערים"
          type='number'
          autoComplete="off"
          startDecorator={iconUi({id: 'goals', sx: { color: '#6aa84f' }})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="outlined"
          size={size}
          slotProps={{ input: { min: 0, max: max } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
