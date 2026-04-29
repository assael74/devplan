/// ui/fields/inputUi/teams/TeamLeaguePosField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TeamLeagueNameField({
  required,
  error ,
  value,
  onChange,
  disabled,
  color = 'neutral',
  helperText,
  label = 'ליגה',
  placeholder = 'ליגה',
  readOnly,
  variant = 'outlined',
  size = 'sm'
}) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px' }}>{label}</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          color={color}
          startDecorator={iconUi({id: 'league'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant={variant}
          size={size}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
