/// ui/fields/checkUi/games/GameHomeSelector.js
import * as React from 'react';
import { chipActiveProps } from '../X_Style'
import { iconUi } from '../../../core/icons/iconUi.js';
import { Box, Typography, Chip } from '@mui/joy';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

export default function GameHomeSelector({ value = true, onChange, label, id, size = 'sm' }) {
  const isHomeGame = value === true;

  return (
    <FormControl>
      <Typography level="body-sm" sx={{ fontSize: '12px', lineHeight: 1.4, mb: 1, fontWeight: 500 }}> בית / חוץ </Typography>
      <Chip
        size={size}
        variant='outlined'
        color={isHomeGame ? 'success' : 'danger'}
        startDecorator={iconUi({ id: 'home' })}
        onClick={() => onChange(!isHomeGame)}
        {...chipActiveProps}
      >
        <Typography sx={{ fontSize: size === 'sm' ? '12px' : '14px' }}>{isHomeGame ? 'משחק בית' : 'משחק חוץ'}</Typography>
      </Chip>
    </FormControl>
  );
}
