// ui/fields/tasks/TaskDescriptionField.js

import React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Textarea,
} from '@mui/joy'

export default function TaskDescriptionField({
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  helperText = '',
  required = false,
  error = false,
  label = 'תיאור',
  placeholder = 'למשל: במסך השחקנים קיימת תקלה במיון לפי שם, ויש לבדוק את הלוגיקה, את כיוון המיון ואת התצוגה בטבלה.',
  minRows = 3,
  maxRows = 6,
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

      <Textarea
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        color={error ? 'danger' : 'neutral'}
        variant={variant}
        placeholder={placeholder}
        minRows={minRows}
        maxRows={maxRows}
        slotProps={slotProps}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
