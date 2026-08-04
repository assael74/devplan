// src/ui/fields/core/HourInputField.js

import React, { useEffect, useState } from 'react'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'

import { normalizeTimeHm } from '../../../shared/format/dateUtils.js'

export default function HourInputField({
  id,
  label = 'שעה',
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  size = 'sm',
  variant,
  sx,
  inputSx,
  slotProps,
}) {
  const [hm, setHm] = useState(value || '')

  useEffect(() => {
    setHm(value || '')
  }, [value])

  const commit = (raw) => {
    const next = normalizeTimeHm(raw)

    setHm(next || raw)
    onChange(next || '')
  }

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={sx}
    >
      <FormLabel sx={{ fontSize: 12 }}>
        {label}
      </FormLabel>

      <Input
        id={id}
        type="time"
        value={hm}
        onChange={(event) => setHm(event.target.value)}
        onBlur={() => {
          if (!readOnly) {
            commit(hm)
          }
        }}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        variant={variant}
        slotProps={slotProps}
        sx={inputSx}
      />

      {!!helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
