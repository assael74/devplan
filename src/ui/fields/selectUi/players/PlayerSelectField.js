// ui/fields/selectUi/players/PlayerSelectField.js
import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy'

import playerImage from '../../../core/images/playerImage.jpg'
import { playersSlot } from '../select.sx.js'

import { buildOptions, findSelected } from './logic/playerSelect.logic'
import PlayerSelectValue from './ui/PlayerSelectValue'
import PlayerOptionRow from './ui/PlayerOptionRow'

const clean = (v) => String(v ?? '').trim()

export default function PlayerSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'שייך שחקן',
  placeholder = 'בחר…',
  teamId,
}) {
  const normalizedOptions = useMemo(
    () => buildOptions(options, teamId, playerImage),
    [options, teamId]
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
          <PlayerSelectValue opt={selectedOpt} />
        )}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <PlayerOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
