// ui/fields/scouting/ScoutIfaLinkField.js

import React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'

export default function ScoutIfaLinkField({
  value = '',
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  readOnly = false,
  label = 'קישור לאתר ההתאחדות',
  placeholder = 'קישור לפרופיל באתר ההתאחדות',
  size = 'sm',
  variant = 'outlined',
  sx,
  slotProps,
}) {
  const handleChange = (event) => {
    if (readOnly || typeof onChange !== 'function') return
    onChange(event.target.value)
  }

  return (
    <FormControl
      required={required}
      error={Boolean(error)}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      {label ? (
        <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      ) : null}

      <Input
        type="url"
        size={size}
        variant={variant}
        value={value}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'addLink', size })}
        onChange={handleChange}
        slotProps={slotProps}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
