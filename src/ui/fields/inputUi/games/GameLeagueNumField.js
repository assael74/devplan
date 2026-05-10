/// ui/fields/inputUi/games/GoalsAgainstField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GameLeagueNumField({
  required,
  error ,
  value,
  onChange,
  disabled,
  label = 'מחזור מספר',
  placeholder = 'מחזור מספר',
  helperText,
  color = 'neutral',
  readOnly,
  size = 'sm'
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>{label}</FormLabel>
        <Input
          value={value ?? 0}
          type='number'
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          color={color}
          startDecorator={iconUi({id: 'league'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="outlined"
          size={size}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
