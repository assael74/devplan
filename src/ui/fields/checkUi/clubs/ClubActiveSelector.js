import * as React from 'react';
import { chipActiveProps } from '../X_Style'
import { iconUi } from '../../../core/icons/iconUi.js';
import { Box, Typography, Chip } from '@mui/joy';

export default function ClubActiveSelector({ value = false, onChange, size = 'sm' }) {
  const isActive = value === true;

  return (
    <Box>
      <Chip
        size={size}
        variant={isActive ? 'solid' : 'outlined'}
        color={isActive ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'active' })}
        onClick={() => onChange(!isActive)}
        {...chipActiveProps}
      >
        פעילה
      </Chip>
    </Box>
  );
}
