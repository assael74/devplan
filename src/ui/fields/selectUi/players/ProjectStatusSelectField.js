// src/ui/fields/selectUi/players/ProjectStatusSelectField.js

import * as React from 'react'
import { FormControl, FormLabel, Select, Option } from '@mui/joy'
import { PROJECT_STATUS_CANDIDATE } from '../../../../shared/players/players.constants.js'

import { buildOptions, findSelected } from './logic/projectStatusSelect.logic'
import ProjectStatusSelectValue from './ui/ProjectStatusSelectValue'
import ProjectStatusOptionRow from './ui/ProjectStatusOptionRow'

const clean = (v) => String(v ?? '').trim()

export default function ProjectStatusSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  label = 'סטטוס תהליך פרויקט',
  placeholder = 'בחר סטטוס',
  size = 'sm',
}) {
  const normalizedOptions = React.useMemo(
    () => buildOptions(PROJECT_STATUS_CANDIDATE),
    []
  )

  const selectedOpt = React.useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = React.useCallback(
    (_, nextValue) => {
      onChange(clean(nextValue))
    },
    [onChange]
  )

  return (
    <FormControl sx={{ width: '100%' }} error={Boolean(error)}>
      <FormLabel required={required} sx={{ fontSize: 12 }}>
        {label}
      </FormLabel>

      <Select
        size={size}
        disabled={disabled}
        value={clean(value) || null}
        onChange={handleChange}
        placeholder={placeholder}
        renderValue={() => <ProjectStatusSelectValue opt={selectedOpt} />}
      >
        {normalizedOptions.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            <ProjectStatusOptionRow opt={opt} />
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
