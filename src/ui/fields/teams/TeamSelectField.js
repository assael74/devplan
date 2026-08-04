// ui/fields/teams/TeamSelectField.js

import React, { useCallback, useMemo } from 'react'
import { FormControl, FormHelperText, FormLabel, Option, Select } from '@mui/joy'
import { entitySelectSlotProps } from '../core/sx/select.sx.js'
import { buildOptions, findSelected } from './logic/teamSelect.logic'
import TeamSelectValue from './ui/TeamSelectValue'
import TeamOptionRow from './ui/TeamOptionRow'

const clean = (value) => String(value || '').trim()

export default function TeamSelectField({
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = false,
  helperText,
  size = 'sm',
  readOnly = false,
  label = 'שייך קבוצה',
  placeholder = 'בחר…',
  clubId,
  chip = true,
  sx,
  slotProps,
}) {
  const normalizedOptions = useMemo(
    () => buildOptions(options, clubId),
    [options, clubId]
  )

  const selectedOpt = useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (disabled || readOnly || !onChange) return
      onChange(clean(nextValue))
    },
    [disabled, onChange, readOnly]
  )

  return (
    <FormControl
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      sx={[{ width: '100%' }, sx]}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

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
          <TeamSelectValue opt={selectedOpt} chip={chip} />
        )}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <TeamOptionRow opt={opt} />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
