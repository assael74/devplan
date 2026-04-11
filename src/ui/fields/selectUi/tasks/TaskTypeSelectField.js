// ui/fields/selectUi/tasks/TaskTypeSelectField.js

import React, { useMemo, useCallback } from 'react'
import { FormControl, FormLabel, FormHelperText, Select, Option } from '@mui/joy'

import SelectValue from './ui/SelectValue.js'
import OptionRow from './ui/OptionRow.js'
import { buildOptions, findSelected } from './logic/tasksSelect.logic.js'
import { getTaskTypeOptionsByWorkspace } from '../../../../shared/tasks/tasks.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js'

const clean = (t) => String(t ?? '').trim()

export default function TaskTypeSelectField({
  workspace = '',
  value = '',
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  size = 'sm',
  readOnly = false,
  label = 'סוג משימה',
  placeholder,
}) {
  const normalizedOptions = useMemo(() => {
    return buildOptions(getTaskTypeOptionsByWorkspace(workspace))
  }, [workspace])

  const selectedOpt = useMemo(
    () => findSelected(value, normalizedOptions),
    [value, normalizedOptions]
  )

  const handleChange = useCallback(
    (_, nextValue) => {
      if (readOnly) return
      onChange(clean(nextValue))
    },
    [onChange, readOnly]
  )

  const resolvedPlaceholder = workspace ? (placeholder || 'בחר סוג משימה') : 'בחר קודם אזור עבודה'

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} required={required} error={error}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Select
        variant="outlined"
        size={size}
        disabled={disabled || readOnly || !workspace}
        value={clean(value) || null}
        placeholder={resolvedPlaceholder}
        slotProps={{
          listbox: {
            className: 'dpScrollThin',
            sx: { maxHeight: 300, pl: 0.5, },
          },
        }}
        onChange={handleChange}
        renderValue={() => (
          <SelectValue
            opt={selectedOpt}
            placeholder={resolvedPlaceholder}
            fallbackLabel="סוג משימה"
            fallbackIcon="taskType"
          />
        )}
      >
        {normalizedOptions.map((item) => (
          <Option key={item.value} value={item.value} label={item.searchKey} sx={{ borderRadius: 'sm', my: 0.1 }}>
            <OptionRow
              item={item}
              fallbackLabel="סוג משימה"
              fallbackIcon="taskType"
            />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
