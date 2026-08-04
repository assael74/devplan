/// ui/fields/clubs/ClubIfaLinkField.js
import React from 'react'
import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'

export default function ClubIfaLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  variant = 'outlined',
  label = 'קישור לאתר ההתאחדות',
  placeholder = 'קישור לפרופיל מועדון באתר התאחדות',
  sx,
  slotProps,
}) {
  const handleChange = (event) => {
    if (readOnly || !onChange) return
    onChange(event.target.value)
  }

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={sx}
    >
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        type="url"
        size={size}
        value={value}
        variant={variant}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        startDecorator={iconUi({ id: 'addLink', size })}
        onChange={handleChange}
        slotProps={slotProps}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
