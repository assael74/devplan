/// ui/fields/inputUi/clubs/ClubNameField.js
import * as React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function ClubNameField({ required, error , value, onChange, disabled, helperText, readOnly, size = 'sm' }) {
  return (
    <>
      <FormControl>
        <FormLabel required={required} sx={{ fontSize: '12px' }}>שם מועדון</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם מועדון"
          endDecorator={iconUi({id: 'clubs'})}
          error={error}
          autoComplete="off"
          disabled={disabled}
          variant="soft"
          size={size}
          readOnly={readOnly}
        />
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </>
  );
}
