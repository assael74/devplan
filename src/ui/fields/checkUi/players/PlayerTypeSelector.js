import * as React from 'react'
import { activeSx as sx } from './sx/check.sx'
import { iconUi } from '../../../core/icons/iconUi.js'
import { Box, Chip } from '@mui/joy'

export default function PlayerTypeSelector({
  value,
  onChange,
  size = 'sm',
  disabled = false,
}) {
  const isProject = Boolean(value)
  const idIcon = isProject ? 'project' : 'noneType'
  const title = size === 'xs' ? 'פרויקט' : 'שחקן פרויקט'

  return (
    <Box sx={{ minWidth: 0 }}>
      <Chip
        size={size === 'xs' ? 'sm' : size}
        variant={isProject ? 'solid' : 'outlined'}
        color={isProject ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: idIcon })}
        onClick={disabled ? undefined : () => onChange(!isProject)}
        sx={sx.chip(size)}
      >
        {title}
      </Chip>
    </Box>
  )
}
