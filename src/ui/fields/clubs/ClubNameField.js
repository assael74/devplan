/// ui/fields/clubs/ClubNameField.js

import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'
import { iconUi } from '../../core/icons/iconUi.js'

export default function ClubNameField({
  required = false,
  error = false,
  value = '',
  onChange,
  disabled = false,
  helperText,
  readOnly = false,
  variant = 'outlined',
  size = 'sm',
  label = 'שם מועדון',
  placeholder = 'שם מועדון',
  sx,
  slotProps,
}) {
  const handleChange = (event) => {
    if (readOnly || !onChange) return
    onChange(event.target.value)
  }

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={{ minWidth: 0, width: '100%', ...sx }}
    >
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        endDecorator={iconUi({ id: 'clubs' })}
        error={error}
        autoComplete="off"
        disabled={disabled}
        variant={variant}
        size={size}
        readOnly={readOnly}
        sx={{ minWidth: 0, width: '100%' }}
        slotProps={slotProps}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
