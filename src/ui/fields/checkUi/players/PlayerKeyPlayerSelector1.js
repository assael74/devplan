import * as React from 'react';
import { chipActiveProps } from '../X_Style'
import { iconUi } from '../../../core/icons/iconUi.js';
import { Box, Typography, Chip } from '@mui/joy';

export default function PlayerKeyPlayerSelector({ value = false, onChange, size = 'md' }) {
  const isKey = value === true;

  return (
    <Box>
      <Chip
        size={size}
        variant={isKey ? 'solid' : 'outlined'}
        color={isKey ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'keyPlayer' })}
        onClick={() => onChange(!isKey)}
        {...chipActiveProps}
      >
        שחקן מפתח
      </Chip>
    </Box>
  );
}
