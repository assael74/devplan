// ui/fields/teams/TeamActiveSelector.js

import * as React from 'react'
import { Box, Chip } from '@mui/joy'
import { chipActiveProps } from '../core/sx/checkField.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamActiveSelector({
  value = false,
  onChange,
  size = 'sm',
  disabled = false,
  readOnly = false,
  sx,
}) {
  const isActive = value === true

  const handleClick = () => {
    if (disabled || readOnly || !onChange) return
    onChange(!isActive)
  }

  return (
    <Box sx={sx}>
      <Chip
        size={size}
        disabled={disabled}
        variant={isActive ? 'solid' : 'outlined'}
        color={isActive ? 'success' : 'neutral'}
        startDecorator={iconUi({ id: 'active' })}
        onClick={handleClick}
        {...chipActiveProps}
      >
        פעילה
      </Chip>
    </Box>
  )
}
