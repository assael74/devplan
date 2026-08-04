// ui/fields/payments/PaymentStatusSelectField.js

import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormHelperText,
  FormLabel,
} from '@mui/joy'

import { entitySelectSlotProps } from '../core/sx/select.sx.js'
import { PAYMENT_STATUSES } from '../../../shared/payments/payments.constants.js'

import { buildOptions, findSelected } from './logic/paymentSelect.logic.js'
import PaymentSelectValue from './ui/PaymentSelectValue.js'
import PaymentOptionRow from './ui/PaymentOptionRow.js'

const clean = (value) => String(value === null || value === undefined ? '' : value).trim()

export default function PaymentStatusSelectField({
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  size = 'sm',
  readOnly = false,
  label = 'סטטוס תשלום',
  placeholder = 'בחר סטטוס',
  chip = true,
  sx,
  slotProps,
}) {
  const sourceOptions =
    Array.isArray(options) && options.length
      ? options
      : PAYMENT_STATUSES

  const normalizedOptions = useMemo(
    () => buildOptions(sourceOptions),
    [sourceOptions]
  )

  const selectedOpt = useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (readOnly || typeof onChange !== 'function') return
      onChange(clean(nextValue))
    },
    [onChange, readOnly]
  )

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

      <Select
        size={size}
        disabled={disabled || readOnly}
        value={clean(value) || null}
        onChange={handleChange}
        placeholder={placeholder}
        slotProps={{
          ...entitySelectSlotProps,
          ...slotProps,
        }}
        renderValue={() => (
          <PaymentSelectValue opt={selectedOpt} chip={chip} />
        )}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <PaymentOptionRow opt={opt} />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
