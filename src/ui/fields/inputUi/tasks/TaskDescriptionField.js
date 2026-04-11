// ui/fields/inputUi/tasks/TaskDescriptionField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Textarea } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'

export default function TaskDescriptionField(props) {
  const {
    value = '',
    onChange,
    disabled = false,
    helperText = '',
    required = false,
    error = false,
    label = 'תיאור',
    placeholder = 'למשל: במסך השחקנים קיימת תקלה במיון לפי שם, ויש לבדוק את הלוגיקה, את כיוון המיון ואת התצוגה בטבלה.',
    minRows = 3,
    maxRows = 6,
  } = props

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} error={error} required={required}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        variant="outlined"
        placeholder={placeholder}
        minRows={minRows}
        maxRows={maxRows}
        sx={{ width: '100%', minWidth: 0 }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
