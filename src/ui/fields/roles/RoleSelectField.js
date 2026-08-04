// ui/fields/roles/RoleSelectField.js

import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormHelperText,
  FormLabel,
} from '@mui/joy'

import { entitySelectSlotProps } from '../core/sx/select.sx.js'
import { buildOptions, findSelected } from './logic/roleSelect.logic.js'
import RoleSelectValue from './ui/RoleSelectValue'
import RoleOptionRow from './ui/RoleOptionRow'

const clean = (value) => String(value === null || value === undefined ? '' : value).trim()

export default function RoleSelectField({
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  size = 'sm',
  readOnly = false,
  label = 'בחר איש מקצוע',
  placeholder = 'בחר…',
  sx,
  slotProps,
}) {
  const normalizedOptions = useMemo(() => buildOptions(options), [options])

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
        renderValue={() => <RoleSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <RoleOptionRow opt={opt} />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
