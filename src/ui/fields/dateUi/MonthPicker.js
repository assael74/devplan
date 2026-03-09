// fields/dateUi/MonthOnlySelectField.js
import React, { useMemo } from 'react'
import { FormControl, FormLabel, FormHelperText, Select, Option } from '@mui/joy'

const MONTHS = [
  { id: 1, label: 'ינואר' },
  { id: 2, label: 'פברואר' },
  { id: 3, label: 'מרץ' },
  { id: 4, label: 'אפריל' },
  { id: 5, label: 'מאי' },
  { id: 6, label: 'יוני' },
  { id: 7, label: 'יולי' },
  { id: 8, label: 'אוגוסט' },
  { id: 9, label: 'ספטמבר' },
  { id: 10, label: 'אוקטובר' },
  { id: 11, label: 'נובמבר' },
  { id: 12, label: 'דצמבר' },
]

export default function MonthPicker({
  value,
  onChange,
  label = 'חודש',
  placeholder = 'בחר חודש',
  disabled,
  required,
  error,
  helperText,
  size = 'sm',
}) {
  const selected = useMemo(
    () => MONTHS.find((m) => m.id === Number(value)) || null,
    [value]
  )

  const handleChange = (_, newValue) => {
    onChange(newValue ? Number(newValue) : null)
  }

  return (
    <FormControl required={required} error={error} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Select
        size={size}
        value={value || null}
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
