// ui/fields/tasks/TaskDueDateField.js

import React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

export default function TaskDueDateField({
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  helperText = '',
  required = false,
  error = false,
  label = 'תאריך יעד',
  placeholder = '',
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
      error={Boolean(error)}
      required={required}
      disabled={disabled}
      sx={{ width: '100%', minWidth: 0, ...sx }}
    >
      {label ? <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel> : null}

      <Input
        type="date"
        size={size}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        color={error ? 'danger' : 'neutral'}
        variant={variant}
        placeholder={placeholder}
        slotProps={slotProps}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
