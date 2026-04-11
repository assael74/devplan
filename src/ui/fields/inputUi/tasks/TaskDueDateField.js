// ui/fields/inputUi/tasks/TaskDueDateField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

export default function TaskDueDateField(props) {
  const {
    value = '',
    onChange,
    disabled = false,
    helperText = '',
    required = false,
    error = false,
    label = 'תאריך יעד',
    placeholder = '',
    size = 'sm',
  } = props

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} error={error} required={required}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Input
        type="date"
        size={size}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        variant="outlined"
        placeholder={placeholder}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
