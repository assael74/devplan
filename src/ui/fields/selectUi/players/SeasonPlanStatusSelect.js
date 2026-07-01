// ui/fields/selectUi/players/SeasonPlanStatusSelect.js

import React, { useCallback, useMemo } from 'react'
import { FormControl, FormLabel, Option, Select } from '@mui/joy'

import { SEASON_PLAN_STATUS_OPTIONS } from '../../../../shared/players/players.constants.js'

import {
  buildSeasonPlanStatusOptions,
  findSeasonPlanStatusOption,
} from './logic/seasonPlanStatusSelect.logic.js'

import SquadRoleOptionRow from './ui/SquadRoleOptionRow.js'
import SquadRoleSelectValue from './ui/SquadRoleSelectValue.js'

const clean = value => String(value ?? '').trim()

export default function SeasonPlanStatusSelect({
  value,
  onChange,
  options = SEASON_PLAN_STATUS_OPTIONS,
  disabled = false,
  required = false,
  error,
  size = 'sm',
  readOnly = false,
  label = 'תכנון לעונה',
  placeholder = 'בחר סטטוס לעונה...',
}) {
  const normalizedOptions = useMemo(() => {
    return buildSeasonPlanStatusOptions(options)
  }, [options])

  const selectedOption = useMemo(() => {
    return findSeasonPlanStatusOption(value, normalizedOptions)
  }, [value, normalizedOptions])

  const handleChange = useCallback((_, nextValue) => {
    if (readOnly || typeof onChange !== 'function') return
    onChange(clean(nextValue))
  }, [onChange, readOnly])

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
        renderValue={() => <SquadRoleSelectValue opt={selectedOption} />}
      >
        {normalizedOptions.map(option => (
          <Option key={option.value} value={option.value}>
            <SquadRoleOptionRow opt={option} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
