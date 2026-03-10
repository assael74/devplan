/// ui/fields/dateUi/DateInputField.js
import React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import FormHelperText from '@mui/joy/FormHelperText'

export default function DateInputField({
  label = 'תאריך',
  value,
  onChange,
  required = false,
  disabled = false,
  helperText = '',
}) {
  return (
    <FormControl required={required} disabled={disabled} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
      />

      {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
