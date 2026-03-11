// src/ui/fields/selectUi/videos/VideoSelectField.js

import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy'

import playerImage from '../../../core/images/playerImage.jpg'
import { playersSlot } from '../select.sx.js'

import { buildOptions, findSelected } from './logic/videoSelect.logic.js'
import VideoSelectValue from './ui/VideoSelectValue.js'
import VideoOptionRow from './ui/VideoOptionRow.js'

const clean = (v) => String(v ?? '').trim()

export default function VideoSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'שיוך וידאו',
  placeholder = 'בחר וידאו…',
  playerId,
  teamId,
}) {
  const normalizedOptions = useMemo(
    () => buildOptions(options, { playerId, teamId, fallbackImage: playerImage }),
    [options, playerId, teamId]
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
        renderValue={() => <VideoSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <VideoOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
