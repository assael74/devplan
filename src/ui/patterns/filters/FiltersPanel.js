// ui/patterns/filters/FiltersPanel.js

import React from 'react'
import { Box, Sheet, Typography, Chip, Input } from '@mui/joy'
import { alpha } from '@mui/system'
import MonthYearPicker from '../../fields/dateUi/MonthYearPicker.js'
import { iconUi } from '../../core/icons/iconUi.js'

const TONE_COLORS = {
  green: '#16A34A',
  orange: '#F97316',
  blue: '#2563EB',
  purple: '#7C3AED',
  yellow: '#D97706',
  cyan: '#0891B2',
  teal: '#0F766E',
  neutral: '#64748B',
}

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

function getOptionColor(opt = {}) {
  return opt.color || TONE_COLORS[opt.tone] || ''
}

function renderOptionIcon(opt = {}, selected = false) {
  if (opt.startDecorator) return opt.startDecorator
  if (!opt.iconId) return null

  const color = getOptionColor(opt) || '#64748B'

  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: selected ? alpha(color, 0.16) : alpha(color, 0.1),
        color,

        '& svg': {
          fontSize: 14,
        },
      }}
    >
      {iconUi({ id: opt.iconId, size: 'sm' })}
    </Box>
  )
}

function getOptionChipSx(opt = {}, selected = false) {
  const color = getOptionColor(opt)

  if (!color) {
    return {
      borderRadius: 12,
    }
  }

  return {
    borderRadius: 12,
    fontWeight: 700,
    color: selected ? color : 'text.primary',
    borderColor: alpha(color, selected ? 0.42 : 0.24),
    bgcolor: selected ? alpha(color, 0.12) : alpha(color, 0.035),

    '&:hover': {
      borderColor: alpha(color, 0.5),
      bgcolor: alpha(color, selected ? 0.16 : 0.08),
    },
  }
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
                      startDecorator={renderOptionIcon(opt, selected)}
                      onClick={() => {
                        if (opt.disabled) return

                        if (isMulti) {
                          onChange(group.key, toggleInArray(currentValue, opt.value))
                          return
                        }

                        onChange(group.key, selected ? 'all' : opt.value)
                      }}
                      sx={getOptionChipSx(opt, selected)}
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
