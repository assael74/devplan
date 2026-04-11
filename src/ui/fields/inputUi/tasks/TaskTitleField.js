// ui/fields/inputUi/tasks/TaskTitleField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

export default function TaskTitleField(props) {
  const {
    value = '',
    onChange,
    disabled = false,
    helperText = '',
    required = false,
    error = false,
    label = 'כותרת',
    placeholder = 'למשל: לתקן מיון בטבלת שחקנים',
    size = 'sm',
  } = props

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} error={error} required={required}>
      {label ? <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel> : null}

      <Input
        size={size}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        variant="outlined"
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'title', size: 'sm' })}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
