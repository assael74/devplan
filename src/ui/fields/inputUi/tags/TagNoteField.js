// ui/fields/inputUi/tags/TagNoteField.js
import * as React from 'react'
import { Input, FormControl, FormLabel, FormHelperText } from '@mui/joy'

const MAX = 20

export default function TagNoteField({
  value,
  onChange,
  label = 'הסבר תג',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
  maxLength = MAX,
  placeholder = 'עד 20 תווים',
}) {
  const v = String(value ?? '')

  const onLocalChange = (next) => {
    const s = String(next ?? '')
    const clipped = s.length > maxLength ? s.slice(0, maxLength) : s
    onChange(clipped)
  }

  return (
    <FormControl error={error} disabled={disabled}>
      <FormLabel required={required}>{label}</FormLabel>

      <Input
        placeholder={placeholder}
        value={v}
        size={size}
        autoComplete="off"
        onChange={(e) => onLocalChange(e.target.value)}
        slotProps={{ input: { maxLength } }}
      />

      <FormHelperText>{v.length}/{maxLength}</FormHelperText>
    </FormControl>
  )
}
