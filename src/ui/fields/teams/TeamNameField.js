// ui/fields/teams/TeamNameField.js

import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamNameField({
  required = true,
  error = false,
  value = '',
  onChange,
  disabled = false,
  helperText,
  readOnly = false,
  label = 'שם קבוצה',
  placeholder = 'שם קבוצה',
  variant = 'outlined',
  size = 'sm',
  sx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={[{ minWidth: 0, width: '100%' }, sx]}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Input
        value={value}
        onChange={(event) => onChange && onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete='off'
        endDecorator={iconUi({ id: 'teams' })}
        error={Boolean(error)}
        readOnly={readOnly}
        disabled={disabled}
        variant={variant}
        size={size}
        sx={{ minWidth: 0, width: '100%' }}
        slotProps={slotProps}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
