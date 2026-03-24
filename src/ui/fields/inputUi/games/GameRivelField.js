/// ui/fields/inputUi/games/GameRivelField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GameRivelField({
  required,
  error ,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  size = 'sm',
  variant = 'soft'
}) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שם היריבה</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם קבוצה"
          autoComplete="off"
          endDecorator={iconUi({id: 'rivel'})}
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
