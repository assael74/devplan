// ui/fields/selectUi/tasks/TaskStatusSelectField.js

import React, { useMemo, useCallback } from 'react'
import { FormControl, FormLabel, FormHelperText, Select, Option } from '@mui/joy'

import SelectValue from './ui/SelectValue.js'
import OptionRow from './ui/OptionRow.js'
import { buildOptions, findSelected } from './logic/tasksSelect.logic.js'
import { taskStatusOptions } from '../../../../shared/tasks/tasks.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js'

const clean = (t) => String(t ?? '').trim()

export default function TaskStatusSelectField({
  value = '',
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  size = 'sm',
  readOnly = false,
  label = 'סטטוס',
  placeholder = 'בחר סטטוס',
}) {
  const normalizedOptions = useMemo(() => {
    return buildOptions(taskStatusOptions)
  }, [])

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

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} required={required} error={error}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Select
        variant="outlined"
        size={size}
        disabled={disabled || readOnly}
        value={clean(value) || null}
        placeholder={placeholder}
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
            placeholder={placeholder}
            fallbackLabel="סטטוס"
            fallbackIcon="status"
          />
        )}
      >
        {normalizedOptions.map((item) => (
          <Option key={item.value} value={item.value} label={item.searchKey} sx={{ borderRadius: 'sm', my: 0.1 }}>
            <OptionRow
              item={item}
              fallbackLabel="סטטוס"
              fallbackIcon="status"
            />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
