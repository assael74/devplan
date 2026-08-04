// src/ui/fields/core/GenericInputField.js

import * as React from 'react'
import {
  FormControl,
  FormHelperText,
  Input,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'

export default function GenericInputField({
  id,
  label,
  value,
  onChange,
  readOnly = false,
  type = 'text',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  placeholder = '',
  onClick = () => {},
  iconId = '',
  variant = 'soft',
  size = 'sm',
  sx,
  inputSx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={{ width: '100%', ...sx }}
    >
      {label && (
        <Typography
          sx={{
            fontSize: '12px',
            lineHeight: 1.4,
            mb: 0.6,
            fontWeight: 500,
            alignSelf: 'flex-start',
          }}
        >
          {label} {required && '*'}
        </Typography>
      )}

      <Input
        id={id}
        type={type}
        value={value == null ? '' : value}
        startDecorator={iconId ? iconUi({ id: iconId }) : undefined}
        onChange={(event) => onChange(event.target.value)}
        onClick={onClick}
        placeholder={placeholder || label}
        required={required}
        autoComplete="off"
        disabled={disabled}
        variant={variant}
        size={size}
        readOnly={readOnly}
        slotProps={slotProps}
        sx={{
          '&:hover': {
            backgroundColor: '#eef4ff',
          },
          ...inputSx,
        }}
      />

      {!!helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
