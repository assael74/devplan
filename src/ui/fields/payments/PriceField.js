// ui/fields/payments/PriceField.js

import * as React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

export default function PriceField({
  value,
  onChange,
  label = 'סכום לתשלום',
  placeholder = '0 הכנס סכום',
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  readOnly = false,
  size = 'sm',
  variant = 'outlined',
  max = null,
  sx,
  slotProps,
}) {
  const handleChange = (event) => {
    if (readOnly || typeof onChange !== 'function') return
    onChange(event.target.value)
  }

  return (
    <FormControl
      required={required}
      error={Boolean(error)}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      {label ? (
        <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      ) : null}

      <Input
        value={value === null || value === undefined ? 0 : value}
        type="number"
        size={size}
        variant={variant}
        autoComplete="off"
        onChange={handleChange}
        placeholder={placeholder}
        startDecorator="₪"
        disabled={disabled}
        readOnly={readOnly}
        slotProps={{
          ...slotProps,
          input: {
            min: 0,
            ...(max != null ? { max } : {}),
            ...slotProps?.input,
          },
        }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
