/// ui/fields/inputUi/teams/TeamLeagueLevelField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TeamLeagueLevelField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  variant = 'soft',
  size = 'sm',
  max = 5
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>רמת ליגה</FormLabel>
        <Input
          value={value ?? 0}
          placeholder="רמת ליגה"
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
