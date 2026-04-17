// playerProfile/mobile/modules/meetings/components/MeetingsFilters.js

import React from 'react'
import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { listSx as sx } from './sx/list.sx'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

function findSelectedOption(options, value) {
  return (options || []).find((option) => String(option.value) === String(value)) || null
}

function renderOptionLabel(option) {
  const label = option?.label || ''
  const count = option?.count || 0

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}
        <Typography level="body-sm" noWrap>
          {label}
        </Typography>
      </Box>

      <Typography level="body-xs" sx={{ color: 'text.tertiary', flexShrink: 0 }}>
        {count}
      </Typography>
    </Box>
  )
}

function renderSelectedValue(option, fallbackLabel) {
  if (!option) return fallbackLabel

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}
      <Typography level="body-sm" noWrap>
        {option?.label || fallbackLabel}
      </Typography>
    </Box>
  )
}

export default function MeetingsFilters({
  filters,
  filterOptions,
  onChange,
}) {
  const types = Array.isArray(filterOptions?.types) ? filterOptions.types : []
  const statuses = Array.isArray(filterOptions?.statuses) ? filterOptions.statuses : []
  const months = Array.isArray(filterOptions?.months) ? filterOptions.months : []

  const selectedType = findSelectedOption(types, filters?.type)
  const selectedStatus = findSelectedOption(statuses, filters?.status)
  const selectedMonth = findSelectedOption(months, filters?.month)

  return (
    <Box>
      <Box sx={sx.filterWrap}>
        <FormControl size="sm">
          <FormLabel>סוג מפגש</FormLabel>
          <Select
            value={filters?.type || null}
            placeholder="כל הסוגים"
            onChange={(_event, value) => onChange({ type: value || '' })}
            renderValue={() => renderSelectedValue(selectedType, 'כל הסוגים')}
            sx={{ minWidth: 0, width: '100%' }}
          >
            <Option value="">כל הסוגים</Option>
            {types.map((option) => (
              <Option
                key={`type:${String(option.value)}`}
                value={option.value}
                disabled={Boolean(option.disabled)}
              >
                {renderOptionLabel(option)}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>סטטוס</FormLabel>
          <Select
            value={filters?.status || null}
            placeholder="כל הסטטוסים"
            onChange={(_event, value) => onChange({ status: value || '' })}
            renderValue={() => renderSelectedValue(selectedStatus, 'כל הסטטוסים')}
            sx={{ minWidth: 0, width: '100%' }}
          >
            <Option value="">כל הסטטוסים</Option>
            {statuses.map((option) => (
              <Option
                key={`status:${String(option.value)}`}
                value={option.value}
                disabled={Boolean(option.disabled)}
              >
                {renderOptionLabel(option)}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>חודש</FormLabel>
          <Select
            value={filters?.month || null}
            placeholder="כל החודשים"
            onChange={(_event, value) => onChange({ month: value || '' })}
            renderValue={() => selectedMonth?.label || 'כל החודשים'}
            sx={{ minWidth: 0, width: '100%' }}
          >
            <Option value="">כל החודשים</Option>
            {months.map((option) => (
              <Option
                key={`month:${String(option.value)}`}
                value={option.value}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%' }}>
                  <Typography level="body-sm" noWrap>
                    {option.label}
                  </Typography>

                  <Typography level="body-xs" sx={{ color: 'text.tertiary', flexShrink: 0 }}>
                    {option.count || 0}
                  </Typography>
                </Box>
              </Option>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={sx.filterBottom}>
        <Checkbox
          size="sm"
          label={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.125 }}>
              <Typography level="body-sm">להציג פגישות שבוטלו</Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                כברירת מחדל פגישות מבוטלות מוסתרות מהרשימה
              </Typography>
            </Box>
          }
          checked={Boolean(filters?.showCanceled)}
          onChange={(event) => onChange({ showCanceled: event.target.checked })}
        />
      </Box>
    </Box>
  )
}
