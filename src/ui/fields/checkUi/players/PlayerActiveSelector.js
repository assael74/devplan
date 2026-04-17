import * as React from 'react';
import { activeSx as sx } from './sx/check.sx'
import { iconUi } from '../../../core/icons/iconUi.js';
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
        sx={sx.chip(size)}
      >
        פעיל
      </Chip>
    </Box>
  );
}
