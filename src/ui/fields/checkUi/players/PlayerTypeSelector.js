// ui/fields/checkUi/players/PlayerTypeSelector.js

import * as React from 'react'
import { Box, Chip } from '@mui/joy'

import { activeSx as sx } from './sx/check.sx'
import { iconUi } from '../../../core/icons/iconUi.js'

const PROJECT_TYPE = 'project'
const NONE_TYPE = 'noneType'

const clean = (value) => String(value || '').trim()

const resolveIsProject = (value) => {
  if (value === true) return true
  return clean(value) === PROJECT_TYPE
}

export default function PlayerTypeSelector({
  value,
  onChange,
  size = 'sm',
  disabled = false,
}) {
  const isProject = resolveIsProject(value)
  const idIcon = isProject ? PROJECT_TYPE : NONE_TYPE
  const title = size === 'xs' ? 'פרויקט' : 'שחקן פרויקט'

  const handleClick = () => {
    if (disabled) return

    onChange(isProject ? NONE_TYPE : PROJECT_TYPE)
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Chip
        size={size === 'xs' ? 'sm' : size}
        variant={isProject ? 'solid' : 'outlined'}
        color={isProject ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: idIcon })}
        onClick={handleClick}
        sx={sx.chip(size)}
      >
        {title}
      </Chip>
    </Box>
  )
}
