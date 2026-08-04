// ui/fields/payments/PaymentTypeSelector.js

import * as React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Typography,
} from '@mui/joy'

import { chipActiveProps } from './sx/paymentCheck.sx.js'
import { iconUi } from '../../core/icons/iconUi.js'

export default function PaymentTypeSelector({
  label = 'סוג תשלום',
  value = false,
  onChange,
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  readOnly = false,
  size = 'sm',
  sx,
}) {
  const isMonthly = value === 'monthlyPayment'
  const nextValue = isMonthly ? 'oneTimePayment' : 'monthlyPayment'

  const handleClick = (event) => {
    event.stopPropagation()
    if (disabled || readOnly || typeof onChange !== 'function') return
    onChange(nextValue)
  }

  return (
    <FormControl
      required={required}
      error={Boolean(error)}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      {label ? (
        <Typography
          level="body-sm"
          sx={{ fontSize: '12px', lineHeight: 1.2, fontWeight: 700 }}
        >
          {label} {required ? '*' : ''}
        </Typography>
      ) : null}

      <Box>
        <Chip
          variant={isMonthly ? 'solid' : 'outlined'}
          color={isMonthly ? 'success' : 'neutral'}
          startDecorator={iconUi({ id: value })}
          onClick={handleClick}
          disabled={disabled}
          {...chipActiveProps}
          size={size}
          sx={{ mt: 1.5 }}
        >
          {isMonthly ? 'חד פעמי' : 'חודשי'}
        </Chip>
      </Box>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
