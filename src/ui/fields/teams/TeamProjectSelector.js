// ui/fields/teams/TeamProjectSelector.js

import * as React from 'react'
import { Box, Chip } from '@mui/joy'
import { chipProjProps } from '../core/sx/checkField.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamProjectSelector({
  value = false,
  onChange,
  size = 'sm',
  disabled = false,
  readOnly = false,
  sx,
}) {
  const isProject = value === true

  const handleClick = () => {
    if (disabled || readOnly || !onChange) return
    onChange(!isProject)
  }

  return (
    <Box sx={sx}>
      <Chip
        size={size}
        disabled={disabled}
        variant={isProject ? 'solid' : 'outlined'}
        color={isProject ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'project' })}
        onClick={handleClick}
        {...chipProjProps}
      >
        פרוייקט
      </Chip>
    </Box>
  )
}
