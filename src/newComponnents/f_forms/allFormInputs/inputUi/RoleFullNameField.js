import * as React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function RoleFullNameField({ required, error , value, onChange, disabled, helperText, size = 'sm', }) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px' }}>שם מלא</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם מלא"
          startDecorator={iconUi({id: 'roles'})}
          error={error}
          autoComplete="off"
          disabled={disabled}
          variant="soft"
          size={size}
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
