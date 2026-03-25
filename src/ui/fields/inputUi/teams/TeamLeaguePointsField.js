/// ui/fields/inputUi/teams/TeamLeaguePointsField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TeamLeaguePointsField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  variant = 'soft',
  size = 'sm',
  max = 99
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>נק ליגה</FormLabel>
        <Input
          value={value ?? 0}
          placeholder="נקודות ליגה"
          onChange={(e) => onChange(e.target.value)}
          type='number'
          autoComplete="off"
          startDecorator={iconUi({id: 'points'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant={variant}
          size={size}
          slotProps={{ input: { min: 0, max: max } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
