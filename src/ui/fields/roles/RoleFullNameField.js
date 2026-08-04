// ui/fields/roles/RoleFullNameField.js

import * as React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'

export default function RoleFullNameField({
  value = '',
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  readOnly = false,
  label = 'שם מלא',
  placeholder = 'שם מלא',
  size = 'sm',
  variant = 'soft',
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
        <FormLabel
          sx={{
            fontSize: '12px',
            textAlign: 'right',
            alignSelf: 'flex-start',
          }}
        >
          {label}
        </FormLabel>
      ) : null}

      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'roles' })}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        variant={variant}
        size={size}
        slotProps={slotProps}
        sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
