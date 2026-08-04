// ui/fields/teams/TeamIfaLinkField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamIfaLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  label = 'קישור לאתר ההתאחדות',
  placeholder = 'קישור לפרופיל קבוצה באתר ההתאחדות',
  variant = 'outlined',
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
        type='url'
        size={size}
        value={value}
        autoComplete='off'
        disabled={disabled}
        readOnly={readOnly}
        variant={variant}
        placeholder={placeholder}
        endDecorator={iconUi({ id: 'addLink', size })}
        onChange={(event) => onChange && onChange(event.target.value)}
        slotProps={slotProps}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
