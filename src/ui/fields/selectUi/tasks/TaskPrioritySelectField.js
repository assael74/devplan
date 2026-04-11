// ui/fields/selectUi/tasks/TaskPrioritySelectField.js

import React, { useMemo, useCallback } from 'react'
import { FormControl, FormLabel, FormHelperText, Select, Option } from '@mui/joy'

import SelectValue from './ui/SelectValue.js'
import OptionRow from './ui/OptionRow.js'
import { buildOptions, findSelected } from './logic/tasksSelect.logic.js'
import {
  TASK_PRIORITY,
  taskPriorityOptions,
} from '../../../../shared/tasks/tasks.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js'

const clean = (t) => String(t ?? '').trim()

export default function TaskPrioritySelectField({
  value = '',
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText = '',
  size = 'sm',
  readOnly = false,
  label = 'עדיפות',
  placeholder = 'בחר עדיפות',
}) {
  const normalizedOptions = useMemo(() => {
    return buildOptions(
      taskPriorityOptions.map((item) => {
        if (item.id === TASK_PRIORITY.LOW) {
          return { ...item, idIcon: item?.idIcon || 'priorityLow' }
        }

        if (item.id === TASK_PRIORITY.MEDIUM) {
          return { ...item, idIcon: item?.idIcon || 'priorityMedium' }
        }

        if (item.id === TASK_PRIORITY.HIGH) {
          return { ...item, idIcon: item?.idIcon || 'priorityHigh' }
        }

        return item
      })
    )
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
            fallbackLabel="עדיפות"
            fallbackIcon="priority"
          />
        )}
      >
        {normalizedOptions.map((item) => (
          <Option key={item.value} value={item.value} label={item.searchKey} sx={{ borderRadius: 'sm', my: 0.1 }}>
            <OptionRow
              item={item}
              fallbackLabel="עדיפות"
              fallbackIcon="priority"
            />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
