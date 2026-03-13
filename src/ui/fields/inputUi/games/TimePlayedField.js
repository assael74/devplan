/// ui/fields/inputUi/games/TimePlayedField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TimePlayedField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  size = 'sm',
  max = 120
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>זמן משחק</FormLabel>
        <Input
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
          placeholder="זמן משחק"
          type='number'
          autoComplete="off"
          startDecorator={iconUi({id: 'timePlayed'})}
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
