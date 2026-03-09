//ui/fields/inputUi/players/PlayerShortNameField.js
import React from 'react';
import { iconUi } from '../../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function PlayerShortNameField({ value, onChange, disabled, size = 'sm', }) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-start' }}>כינוי</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="כינוי שחקן"
          size={size}
          autoComplete="off"
          startDecorator={iconUi({id: 'shortName'})}
          disabled={disabled}
          variant="soft"
          sx={{ '&:hover': { backgroundColor: '#eef4ff' }}}
        />
      </FormControl>

    </>
  );
}
