// ui/fields/tasks/TaskTitleField.js

import React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'

export default function TaskTitleField({
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  helperText = '',
  required = false,
  error = false,
  label = 'כותרת',
  placeholder = 'למשל: לתקן מיון בטבלת שחקנים',
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
        size={size}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        color={error ? 'danger' : 'neutral'}
        variant={variant}
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'title', size: 'sm' })}
        slotProps={slotProps}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
