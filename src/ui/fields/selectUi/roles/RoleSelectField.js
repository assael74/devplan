// ui/fields/selectUi/roles/RoleSelectField.js
import React, { useMemo, useCallback } from 'react'
import { Select, Option, FormControl, FormLabel } from '@mui/joy'
import { playersSlot } from '../select.sx.js'

import { buildOptions, findSelected } from './logic/roleSelect.logic'
import RoleSelectValue from './ui/RoleSelectValue'
import RoleOptionRow from './ui/RoleOptionRow'

const clean = (v) => String(v ?? '').trim()

export default function RoleSelectField({
  value,
  onChange,
  options = [],
  disabled,
  required,
  error,
  size = 'sm',
  readOnly,
  label = 'בחר איש מקצוע',
  placeholder = 'בחר…',
}) {
  const normalizedOptions = useMemo(() => buildOptions(options), [options])

  const selectedOpt = useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (!readOnly) onChange?.(clean(nextValue))
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
        renderValue={() => <RoleSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <RoleOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
