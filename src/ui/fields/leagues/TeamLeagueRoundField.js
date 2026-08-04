// ui/fields/leagues/TeamLeagueRoundField.js

import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import FormHelperText from '@mui/joy/FormHelperText'
import Input from '@mui/joy/Input'
import { iconUi } from '../../core/icons/iconUi.js'

export default function TeamLeagueRoundField({
  required = false,
  error = false,
  value = 0,
  onChange,
  disabled = false,
  helperText,
  readOnly = false,
  label = 'מחזור ליגה',
  placeholder = 'מחזור ליגה',
  color = 'neutral',
  variant = 'outlined',
  size = 'sm',
  min = 0,
  max = 20,
  sx,
  slotProps,
}) {
  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={sx}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange && onChange(event.target.value)}
        type='number'
        autoComplete='off'
        color={color}
        startDecorator={iconUi({ id: 'leaguePos' })}
        error={Boolean(error)}
        readOnly={readOnly}
        disabled={disabled}
        variant={variant}
        size={size}
        sx={{ border: '1px solid', borderColor: 'divider' }}
        slotProps={{
          ...slotProps,
          input: {
            min,
            max,
            ...slotProps?.input,
          },
        }}
      />

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
