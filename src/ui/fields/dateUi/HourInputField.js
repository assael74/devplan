import React, { useEffect, useState } from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'

import { iconUi } from '../../core/icons/iconUi.js'
import { normalizeTimeHm } from '../../../shared/format/dateUtiles.js'

export default function HourInputField({
  label = 'שעה',
  value,      // "HH:mm"
  onChange,   // (hm) => void
  required = false,
  disabled = false,
  sx,
}) {
  const [hm, setHm] = useState(value || '')

  useEffect(() => setHm(value || ''), [value])

  const commit = (raw) => {
    const next = normalizeTimeHm(raw)
    setHm(next || raw)
    onChange(next || '')
  }

  return (
    <FormControl required={required} disabled={disabled}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>
      <Input
        type="time"
        value={hm}
        onChange={(e) => setHm(e.target.value)}
        onBlur={() => commit(hm)}
        size="sm"
      />
    </FormControl>
  )
}
