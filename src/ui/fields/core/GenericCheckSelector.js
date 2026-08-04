// src/ui/fields/core/GenericCheckSelector.js

import * as React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { chipActiveProps } from './sx/checkField.sx.js'

export default function GenericCheckSelector({
  label = '',
  id,
  value = false,
  onChange = () => {},
  trueLabel = 'כן',
  falseLabel = 'לא',
  iconIdFalse = 'toggle',
  iconIdTrue = 'toggle',
  required = false,
  disabled = false,
  readOnly = false,
  error = false,
  helperText = '',
  size = 'sm',
  sx,
  chipSx,
}) {
  const isTrue = value === true
  const isBlocked = disabled || readOnly

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={error}
      sx={{ width: '100%', ...sx }}
    >
      {label && (
        <Typography
          level="body-sm"
          sx={{
            fontSize: '12px',
            lineHeight: 1.4,
            mb: 0.5,
            fontWeight: 500,
          }}
        >
          {label} {required && '*'}
        </Typography>
      )}

      <Box>
        <Chip
          id={id}
          variant={isTrue ? 'solid' : 'outlined'}
          color={isTrue ? 'success' : 'neutral'}
          startDecorator={iconUi({
            id: isTrue ? iconIdTrue : iconIdFalse,
          })}
          onClick={(event) => {
            event.stopPropagation()

            if (isBlocked) {
              return
            }

            onChange(!isTrue)
          }}
          {...chipActiveProps}
          size={size}
          sx={{ mt: 1.5, ...chipSx }}
        >
          {isTrue ? trueLabel : falseLabel}
        </Chip>
      </Box>

      {!!helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
