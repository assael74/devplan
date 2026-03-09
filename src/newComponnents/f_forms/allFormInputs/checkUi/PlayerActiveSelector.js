import * as React from 'react';
import { chipActiveProps } from './X_Style'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex';
import { Box, Typography, Chip } from '@mui/joy';

export default function PlayerActiveSelector({ value = false, onChange, size = 'sm' }) {
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
        פעיל
      </Chip>
    </Box>
  );
}
