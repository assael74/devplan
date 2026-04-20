// ui/fields/selectUi/payments/PaymentSelectField.js

import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy'

import { playersSlot } from '../select.sx.js'
import { PAYMENT_STATUSES } from '../../../../shared/payments/payments.constants.js'

import { buildOptions, findSelected } from './logic/paymentSelect.logic.js'
import PaymentSelectValue from './ui/PaymentSelectValue.js'
import PaymentOptionRow from './ui/PaymentOptionRow.js'

const clean = (v) => String(v ?? '').trim()

export default function PaymentStatusSelectField({
  value,
  onChange,
  options,
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'סטטוס תשלום',
  placeholder = 'בחר סטטוס',
  chip = true,
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
      if (!readOnly) onChange(clean(nextValue))
    },
    [onChange, readOnly]
  )

  return (
    <FormControl sx={{ width: '100%' }} error={Boolean(error)}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        value={clean(value) || null}
        onChange={handleChange}
        placeholder={placeholder}
        slotProps={playersSlot}
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
    </FormControl>
  )
}
