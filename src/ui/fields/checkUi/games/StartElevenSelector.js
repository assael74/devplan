///  ui/fields/checkUi/games/StartElevenSelector.js
import * as React from 'react';
import { chipActiveProps } from '../X_Style'
import { iconUi } from '../../../core/icons/iconUi.js';
import { Box, Typography, Chip } from '@mui/joy';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

export default function StartElevenSelector({ value = true, onChange, label, size = 'sm' }) {
  const isStart = value === true;
  const iconId = value ? 'isStart' : 'isNotStart'

  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px' }}> הרכב </FormLabel>
      <Chip
        size={size}
        variant={isStart ? 'solid' : 'outlined'}
        color={isStart ? 'success' : 'danger'}
        startDecorator={iconUi({ id: iconId })}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!isStart);
        }}
        {...chipActiveProps}
      >
        {isStart ? 'הרכב' : 'ספסל'}
      </Chip>
    </FormControl>
  );
}
