/// ui/fields/inputUi/teams/TeamLeaguePosField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TeamLeaguePosField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  variant = 'soft',
  size = 'sm',
  max = 20
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>מיקום</FormLabel>
        <Input
          value={value ?? 0}
          placeholder="מיקום הקבוצה בטבלה"
          onChange={(e) => onChange(e.target.value)}
          type='number'
          autoComplete="off"
          startDecorator={iconUi({id: 'leaguePos'})}
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
