// ui/fields/roles/RoleActiveSelector.js

import * as React from 'react'
import { Box, Chip, FormControl, FormHelperText } from '@mui/joy'

import { chipActiveProps } from '../core/sx/checkField.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function RoleActiveSelector({
  value = false,
  onChange,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  size = 'sm',
  sx,
}) {
  const isActive = value === true

  const handleChange = () => {
    if (disabled || readOnly || typeof onChange !== 'function') return
    onChange(!isActive)
  }

  return (
    <FormControl error={Boolean(error)} disabled={disabled} sx={sx}>
      <Box>
        <Chip
          size={size}
          variant={isActive ? 'solid' : 'outlined'}
          color={isActive ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: 'active' })}
          onClick={handleChange}
          disabled={disabled}
          {...chipActiveProps}
        >
          פעיל
        </Chip>
      </Box>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
