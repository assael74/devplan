// ui/fields/selectUi/teams/TeamSelectField.js
import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy'

import { playersSlot } from '../select.sx.js'

import { buildOptions, findSelected } from './logic/teamSelect.logic'
import TeamSelectValue from './ui/TeamSelectValue'
import TeamOptionRow from './ui/TeamOptionRow'

const clean = (v) => String(v ?? '').trim()

export default function TeamSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'שייך קבוצה',
  placeholder = 'בחר…',
  clubId,
  chip = true
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
          <TeamSelectValue opt={selectedOpt} chip={chip} />
        )}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <TeamOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
