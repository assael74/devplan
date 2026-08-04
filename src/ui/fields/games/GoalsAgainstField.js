/// ui/fields/games/GoalsAgainstField.js

import * as React from 'react'
import { iconUi } from '../../core/icons/iconUi.js'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'

const GOALS_AGAINST_LABEL = '\u05e9\u05e2\u05e8\u05d9 \u05d7\u05d5\u05d1\u05d4'

const normalizeNonNegative = (value) => {
  if (value === '') return ''

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return value

  return String(Math.max(0, numberValue))
}

export default function GoalsAgainstField({
  required,
  error,
  value,
  onChange,
  disabled,
  label = GOALS_AGAINST_LABEL,
  placeholder = GOALS_AGAINST_LABEL,
  helperText,
  color = 'neutral',
  readOnly,
  size = 'sm',
}) {
  const displayValue = normalizeNonNegative(value === null || value === undefined ? 0 : value)

  return (
    <FormControl sx={{ width: '100%' }} error={error}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        value={displayValue}
        type='number'
        onChange={(e) => onChange(normalizeNonNegative(e.target.value))}
        placeholder={placeholder}
        autoComplete='off'
        color={color}
        startDecorator={iconUi({ id: 'goals', sx: { color: '#f44336' } })}
        error={error}
        readOnly={readOnly}
        disabled={disabled}
        variant='outlined'
        size={size}
        sx={{ border: '1px solid', borderColor: 'divider' }}
        slotProps={{ input: { min: 0 } }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  )
}
