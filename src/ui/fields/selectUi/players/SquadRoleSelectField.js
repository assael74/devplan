// ui/fields/selectUi/players/SquadRoleSelectField.js

import React, { useMemo, useCallback } from 'react'
import {
  Select,
  Option,
  FormControl,
  FormLabel,
} from '@mui/joy'

import { playersSlot } from '../select.sx.js'
import { SQUAD_ROLE_OPTIONS } from '../../../../shared/players/players.constants.js'

import {
  buildSquadRoleOptions,
  findSquadRoleOption,
} from './logic/squadRoleSelect.logic.js'

import SquadRoleSelectValue from './ui/SquadRoleSelectValue.js'
import SquadRoleOptionRow from './ui/SquadRoleOptionRow.js'

const clean = (v) => String(v ?? '').trim()

export default function SquadRoleSelectField({
  value,
  onChange,
  options = SQUAD_ROLE_OPTIONS,
  disabled = false,
  required = false,
  error,
  size = 'sm',
  readOnly = false,
  label = 'תפקיד בסגל',
  placeholder = 'בחר תפקיד...',
}) {
  const normalizedOptions = useMemo(
    () => buildSquadRoleOptions(options),
    [options]
  )

  const selectedOpt = useMemo(
    () => findSquadRoleOption(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (readOnly) return
      onChange(clean(nextValue))
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
        renderValue={() => <SquadRoleSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <SquadRoleOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
