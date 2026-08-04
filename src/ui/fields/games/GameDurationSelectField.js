// ui/fields/games/GameDurationSelectField.js

import * as React from 'react'
import { FormControl, FormHelperText, FormLabel, Option, Select } from '@mui/joy'
import { gameSelectSlotProps } from './sx/gamesSelect.sx.js'

export default function GameDurationSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  helperText,
  label = 'זמן משחק',
  placeholder = 'בחר זמן משחק',
  size = 'sm',
  sx,
  slotProps = {},
}) {
  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={value}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(_, val) => onChange?.(val)}
        placeholder={placeholder}
        slotProps={{ ...gameSelectSlotProps, ...slotProps }}
      >
        <Option value={70}>70 דקות</Option>
        <Option value={80}>80 דקות</Option>
        <Option value={90}>90 דקות</Option>
        <Option value={120}>120 דקות</Option>
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
