// ui/fields/selectUi/clubs/ClubSelectField.js

import React, { useMemo, useCallback } from 'react'
import { Select, Option, FormControl, FormLabel } from '@mui/joy'

import { playersSlot } from '../select.sx.js'

import { buildOptions, findSelected } from './logic/clubSelect.logic'
import ClubSelectValue from './ui/ClubSelectValue'
import ClubOptionRow from './ui/ClubOptionRow'

const clean = (v) => String(v ?? '').trim()

export default function ClubSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'שייך מועדון',
  placeholder = 'בחר…',
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
          <ClubSelectValue opt={selectedOpt} />
        )}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <ClubOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
