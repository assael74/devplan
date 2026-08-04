// ui/fields/clubs/ClubActiveSelector.js

import * as React from 'react'
import { Box, Chip, FormControl, FormHelperText } from '@mui/joy'
import { chipActiveProps } from '../core/sx/checkField.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function ClubActiveSelector({
  value = false,
  onChange,
  size = 'sm',
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  label = 'פעילה',
  sx,
}) {
  const isActive = value === true

  const handleClick = () => {
    if (disabled || readOnly || !onChange) return
    onChange(!isActive)
  }

  return (
    <FormControl disabled={disabled} error={error} sx={sx}>
      <Box>
        <Chip
          size={size}
          variant={isActive ? 'solid' : 'outlined'}
          color={isActive ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: 'active' })}
          disabled={disabled}
          onClick={handleClick}
          {...chipActiveProps}
        >
          {label}
        </Chip>
      </Box>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
