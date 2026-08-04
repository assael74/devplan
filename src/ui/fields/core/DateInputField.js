// src/ui/fields/core/DateInputField.js

import React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import FormHelperText from '@mui/joy/FormHelperText'

export default function DateInputField({
  id,
  label = 'תאריך',
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  size = 'sm',
  variant,
  sx,
  inputSx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={{ width: '100%', ...sx }}
    >
      <FormLabel sx={{ fontSize: 12 }}>
        {label}
      </FormLabel>

      <Input
        id={id}
        type="date"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        variant={variant}
        slotProps={slotProps}
        sx={inputSx}
      />

      {!!helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
