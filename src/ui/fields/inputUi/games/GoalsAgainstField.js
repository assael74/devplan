/// ui/fields/inputUi/games/GoalsAgainstField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GoalsAgainstField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  size = 'sm'
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שערי חובה</FormLabel>
        <Input
          value={value ?? 0}
          type='number'
          onChange={(e) => onChange(e.target.value)}
          placeholder="שערי חובה"
          autoComplete="off"
          startDecorator={iconUi({id: 'goals', sx: { color: '#f44336' }})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="soft"
          size={size}
          slotProps={{ input: { min: 0, max: 20 } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
