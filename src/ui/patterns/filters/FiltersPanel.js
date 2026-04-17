// ui/patterns/filters/FiltersPanel.js

import React from 'react'
import { Box, Sheet, Typography, Chip, Input } from '@mui/joy'
import MonthYearPicker from '../../fields/dateUi/MonthYearPicker.js'

function normalizeToArray(val) {
  if (Array.isArray(val)) return val
  if (val == null || val === '' || val === 'all') return []
  return [val]
}

function toggleInArray(arr, value) {
  const list = normalizeToArray(arr).map(String)
  const nextValue = String(value)
  return list.includes(nextValue)
    ? list.filter((x) => x !== nextValue)
    : [...list, nextValue]
}

export default function FiltersPanel({
  filters = {},
  groups = [],
  fields = [],
  onChange = () => {},
  size = 'sm',
}) {
  const safeGroups = Array.isArray(groups) ? groups : []
  const safeFields = Array.isArray(fields) ? fields : []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {safeFields.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {safeFields.map((field) => {
            const value = filters?.[field.key]

            return (
              <Box key={field.key} sx={{ width: '100%' }}>
                {field.kind === 'monthYear' ? (
                  <MonthYearPicker
                    value={String(value || '')}
                    onChange={(next) => onChange(field.key, next || '')}
                    context={field.context || 'meeting'}
                    size="sm"
                    helperText=""
                  />
                ) : (
                  <Input
                    size="sm"
                    value={value || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </Box>
            )
          })}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {safeGroups.map((group) => {
          const options = Array.isArray(group.options) ? group.options : []
          const currentValue = filters[group.key]
          const isMulti = Boolean(group.multi)

          return (
            <Sheet key={group.key} variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
              <Typography level="body-sm" sx={{ mb: 0.75, fontWeight: 700, opacity: 0.9 }}>
                {group.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {options.map((opt) => {
                  const selected = isMulti
                    ? normalizeToArray(currentValue).map(String).includes(String(opt.value))
                    : String(currentValue) === String(opt.value)

                  return (
                    <Chip
                      key={`${group.key}_${opt.value}`}
                      size={size}
                      variant={selected ? 'soft' : 'outlined'}
                      color={selected ? 'success' : 'neutral'}
                      disabled={Boolean(opt.disabled)}
                      startDecorator={opt.startDecorator}
                      onClick={() => {
                        if (opt.disabled) return

                        if (isMulti) {
                          onChange(group.key, toggleInArray(currentValue, opt.value))
                          return
                        }

                        onChange(group.key, selected ? 'all' : opt.value)
                      }}
                      sx={{ borderRadius: 12 }}
                    >
                      {opt.label}
                    </Chip>
                  )
                })}
              </Box>
            </Sheet>
          )
        })}
      </Box>
    </Box>
  )
}
