import React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { FormControl, FormLabel, FormHelperText } from '@mui/joy';
import Input from '@mui/joy/Input';

export default function PlayerLastNameField({ required, value, onChange, error, disabled, helperText, size = 'sm', }) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-end' }}>שם משפחה</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם משפחה"
          startDecorator={iconUi({id: 'player'})}
          error={error}
          size={size}
          autoComplete="off"
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
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>

    </>
  );
}
