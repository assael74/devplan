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
  color = 'neutral',
  label = 'נקודות ליגה',
  placeholder = 'נקודות ליגה',
  variant = 'outlined',
  size = 'sm',
  max = 99
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>{label}</FormLabel>
        <Input
          value={value ?? 0}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          type='number'
          autoComplete="off"
          color={color}
          startDecorator={iconUi({id: 'points'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant={variant}
          size={size}
          sx={{ border: '1px solid', borderColor: 'divider' }}
          slotProps={{ input: { min: 0, max: max } }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
