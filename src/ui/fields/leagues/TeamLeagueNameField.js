// ui/fields/leagues/TeamLeagueNameField.js

import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamLeagueNameField({
  required = false,
  error = false,
  value = '',
  onChange,
  disabled = false,
  helperText,
  label = 'ליגה',
  placeholder = 'ליגה',
  readOnly = false,
  color = 'neutral',
  variant = 'outlined',
  size = 'sm',
  sx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={sx}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Input
        value={value}
        onChange={(event) => onChange && onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete='off'
        color={color}
        startDecorator={iconUi({ id: 'league' })}
        error={Boolean(error)}
        readOnly={readOnly}
        disabled={disabled}
        variant={variant}
        size={size}
        sx={{ border: '1px solid', borderColor: 'divider' }}
        slotProps={slotProps}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
