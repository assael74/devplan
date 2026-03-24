/// ui/fields/inputUi/teams/TeamNameField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TeamNameField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  variant = 'soft',
  size = 'sm'
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>שם קבוצה</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם קבוצה"
          autoComplete="off"
          endDecorator={iconUi({id: 'teams'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant={variant}
          size={size}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
