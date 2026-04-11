// ui/fields/inputUi/tasks/TaskUrlField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Input, IconButton } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

export default function TaskUrlField(props) {
  const {
    value = '',
    onChange,
    disabled = false,
    helperText = '',
    required = false,
    error = false,
    label = 'קישור',
    placeholder = 'קישור למסך באפליקציה',
    size = 'sm',
    readOnly = false,
    clearable = true,
  } = props

  const hasValue = Boolean(String(value ?? '').trim())

  const handleChange = (event) => {
    if (readOnly) return
    onChange(event.target.value)
  }

  const handleClear = () => {
    if (disabled) return
    onChange('')
  }

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} error={error} required={required}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Input
        size={size}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        color={error ? 'danger' : 'neutral'}
        variant="outlined"
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'link', size: 'sm' })}
        endDecorator={
          clearable && hasValue ? (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              disabled={disabled}
              onClick={handleClear}
            >
              {iconUi({ id: 'clear', size: 'sm' })}
            </IconButton>
          ) : null
        }
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
