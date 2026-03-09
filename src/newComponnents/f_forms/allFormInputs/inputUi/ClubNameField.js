import * as React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function ClubNameField({ required, error , value, onChange, disabled, helperText, readOnly, size = 'sm' }) {
  return (
    <>
      <FormControl>
        <FormLabel required sx={{ fontSize: '12px', textAlign: 'right', alignSelf: 'flex-end' }}>שם מועדון</FormLabel>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="שם מועדון"
          startDecorator={iconUi({id: 'club'})}
          error={error}
          autoComplete="off"
          disabled={disabled}
          variant="soft"
          size={size}
          readOnly={readOnly}
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
