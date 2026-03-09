import React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function PlayerShortNameField({ value, onChange, disabled, size = 'sm', }) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-end' }}>כינוי</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="כינוי שחקן"
          size={size}
          autoComplete="off"
          startDecorator={iconUi({id: 'shortName'})}
          disabled={disabled}
          variant="soft"
          sx={{
            direction: 'rtl',
            textAlign: 'right',
            '& input': {
              direction: 'rtl',
              textAlign: 'right',
            },
            '&:hover': { backgroundColor: '#eef4ff' },
          }}
        />
      </FormControl>

    </>
  );
}
