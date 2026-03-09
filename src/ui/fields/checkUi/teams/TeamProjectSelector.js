import * as React from 'react';
import { Box, Typography, Chip } from '@mui/joy';
import { chipProjProps } from '../X_Style'
import { iconUi } from '../../../core/icons/iconUi.js';

export default function TeamProjectSelector({ value = false, onChange, size = 'sm' }) {
  const isProject = value === true;

  return (
    <Box>
      <Chip
        size={size}
        variant={isProject ? 'solid' : 'outlined'}
        color={isProject ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'project' })}
        onClick={() => onChange(!isProject)}
        {...chipProjProps}
      >
        פרוייקט
      </Chip>
    </Box>
  );
}
