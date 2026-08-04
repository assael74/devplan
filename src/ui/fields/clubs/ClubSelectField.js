// ui/fields/clubs/ClubSelectField.js

import React, { useMemo, useCallback } from 'react'
import { FormControl, FormHelperText, FormLabel, Option, Select } from '@mui/joy'
import { entitySelectSlotProps } from '../core/sx/select.sx.js'
import { buildOptions, findSelected } from './logic/clubSelect.logic'
import ClubSelectValue from './ui/ClubSelectValue'
import ClubOptionRow from './ui/ClubOptionRow'

const clean = (value) => String(value || '').trim()

export default function ClubSelectField({
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = false,
  size = 'sm',
  readOnly = false,
  label = 'שייך מועדון',
  placeholder = 'בחר…',
  helperText,
  sx,
  slotProps,
}) {
  const normalizedOptions = useMemo(
    () => buildOptions(options),
    [options]
  )

  const selectedOpt = useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (readOnly || !onChange) return
      onChange(clean(nextValue))
    },
    [onChange, readOnly]
  )

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={{ width: '100%', ...sx }}
    >
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Select
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        value={clean(value) || null}
        onChange={handleChange}
        placeholder={placeholder}
        slotProps={{ ...entitySelectSlotProps, ...slotProps }}
        renderValue={() => <ClubSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <ClubOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
