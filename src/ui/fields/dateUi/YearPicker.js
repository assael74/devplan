// src/ui/fields/dateUi/YearPicker.js
import * as React from 'react'
import { FormControl, FormLabel, Select, Option, IconButton, Box } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function YearPicker({
  label = 'שנה',
  value,
  onChange,
  size = 'sm',
  placeholder = 'בחר שנה',
  disabled = false,
  required = false,
  clearable = true,
  years,
  range = { past: 25, future: 0 },
  minYear,
  maxYear,
  sx,
}) {
  const currentYear = new Date().getFullYear()

  const list = React.useMemo(() => {
    var arr = Array.isArray(years) ? years.slice() : null

    if (!arr) {
      const past = Math.max(0, Number(range?.past ?? 15))
      const future = Math.max(0, Number(range?.future ?? 0))
      const from = currentYear - past
      const to = currentYear + future
      arr = []
      for (let y = from; y <= to; y++) arr.push(y)
    }

    if (minYear != null) arr = arr.filter((y) => Number(y) >= Number(minYear))
    if (maxYear != null) arr = arr.filter((y) => Number(y) <= Number(maxYear))

    // unique + sort
    const uniq = Array.from(new Set(arr.map((x) => Number(x)))).sort((a, b) => a - b)
    return uniq
  }, [years, range, minYear, maxYear, currentYear])

  const selected = value == null || value === '' ? null : String(value)

  return (
    <FormControl required={required} disabled={disabled} sx={sx}>
      {label ? <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel> : null}

      <Select
        size={size}
        placeholder={placeholder}
        value={selected}
        onChange={(e, next) => onChange(next == null ? '' : String(next))}
        startDecorator={iconUi({ id: 'age' })}
      >
        {list.map((y) => (
          <Option key={String(y)} value={String(y)}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>{y}</Box>
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
