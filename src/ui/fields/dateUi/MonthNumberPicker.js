// fields/dateUi/MonthOnlySelectField.js
import React, { useMemo } from 'react'
import { FormControl, FormLabel, FormHelperText, Select, Option } from '@mui/joy'

const MONTHS = [
  { id: 1, label: 1 },
  { id: 2, label: 2 },
  { id: 3, label: 3 },
  { id: 4, label: 4 },
  { id: 5, label: 5 },
  { id: 6, label: 6 },
  { id: 7, label: 7 },
  { id: 8, label: 8 },
  { id: 9, label: 9 },
  { id: 10, label: 10 },
  { id: 11, label: 11 },
  { id: 12, label: 12 },
]

export default function MonthNumberPicker({
  value,
  onChange,
  label = 'חודש',
  placeholder = 'בחר חודש',
  disabled,
  required,
  error,
  helperText,
  size = 'sm',
  icon = false
}) {
  const selected = useMemo(
    () => MONTHS.find((m) => m.id === Number(value)) || null,
    [value]
  )

  const handleChange = (_, newValue) => {
    onChange(newValue ? String(newValue).padStart(2, '0') : '')
  }

  return (
    <FormControl required={required} error={error} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Select
        size={size}
        value={value ? Number(value) : null}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        renderValue={() => (selected ? selected.label : '')}
        slotProps={{
          listbox: { sx: { maxHeight: 260 } },
        }}
      >
        {MONTHS.map((m) => (
          <Option key={m.id} value={m.id}>
            {m.label}
          </Option>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
