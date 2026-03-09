import * as React from 'react';
import { iconUi } from '../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function RoleFullNameField({ required, error , value, onChange, disabled, helperText, size = 'sm', }) {
  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-start' }}>שם מלא</FormLabel>
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
          sx={{'&:hover': { backgroundColor: '#eef4ff' }}}
        />
      </FormControl>
    </>
  );
}
