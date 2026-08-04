// src/ui/fields/core/PhoneField.js

import * as React from 'react'
import { FormControl, FormLabel, Input } from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { formatPhoneNumber } from '../../../shared/format/contactUtils.js'

export default function PhoneField({
  value,
  onChange,
  label = 'מספר נייד',
  placeholder = 'טלפון',
  required = false,
  error = false,
  disabled = false,
  readOnly = false,
  size = 'sm',
  variant = 'soft',
  startDecorator = iconUi({ id: 'phone' }),
  sx,
  slotProps,
}) {
  const handleChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '')
    onChange(rawValue.slice(0, 10))
  }

  return (
    <FormControl error={error} sx={sx}>
      <FormLabel
        required={required}
        sx={{ fontSize: '12px', fontWeight: 'md' }}
      >
        {label}
      </FormLabel>

      <Input
        value={formatPhoneNumber(value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        size={size}
        inputMode="numeric"
        variant={variant}
        startDecorator={startDecorator}
        slotProps={slotProps}
        onChange={handleChange}
      />
    </FormControl>
  )
}
