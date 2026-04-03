/// ui/fields/inputUi/games/GameVideoLinkField.js

import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function GameVideoLinkField({
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
        <FormLabel required={required} sx={{ fontSize: '12px' }}>קישור וידאו</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="קישור וידאו"
          autoComplete="off"
          endDecorator={iconUi({id: 'addLink'})}
          error={error}
          readOnly={readOnly}
          disabled={disabled}
          variant="outlined"
          size={size}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
