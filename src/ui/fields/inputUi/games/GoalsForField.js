/// ui/fields/inputUi/games/GoalsForField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GoalsForField({
  required,
  error ,
  value,
  onChange,
  disabled,
  label = 'שערי זכות',
  color = 'neutral',
  helperText,
  placeholder = 'שערי זכות',
  readOnly,
  size = 'sm'
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>{label}</FormLabel>
        <Input
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type='number'
          autoComplete="off"
          color={color}
          startDecorator={iconUi({id: 'goals', sx: { color: '#6aa84f' }})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="outlined"
          size={size}
          sx={{ border: '1px solid', borderColor: 'divider' }}
          slotProps={{ input: { min: 0, max: 20 } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
