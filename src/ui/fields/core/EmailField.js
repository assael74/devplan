// src/ui/fields/core/EmailField.js

import * as React from 'react'
import { FormControl, FormLabel, Input } from '@mui/joy'

export default function EmailField({
  value,
  onChange,
  label = 'דוא"ל',
  placeholder = 'you@example.com',
  required = false,
  error = false,
  disabled = false,
  readOnly = false,
  size = 'sm',
  variant = 'soft',
  startDecorator,
  sx,
  slotProps,
}) {
  return (
    <FormControl error={error} sx={sx}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Input
        type="email"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        variant={variant}
        startDecorator={startDecorator}
        slotProps={slotProps}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormControl>
  )
}
