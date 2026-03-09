// src/features/tags/components/TagsFiltersRow.js
import React from 'react'
import { Box, Input, Select, Option, Chip, Stack } from '@mui/joy'
import { sx as pageSx } from '../tags.sx'
import { iconUi } from '../../../ui/core/icons/iconUi.js';
import { getEntityColors } from '../../../ui/core/theme/Colors'
import { TAG_TYPE_OPTIONS, TAG_PARENTS_OPTIONS } from '../../../shared/tags/tags.constants.js'

export default function TagsFiltersRow({ value, onChange }) {
  const v = value || {}

  return (
    <Box sx={pageSx.filtersRow}>
      <Input
        size="sm"
        placeholder="חיפוש תג / slug…"
        value={v.q || ''}
        onChange={(e) => onChange({ q: e.target.value })}
        sx={{ minWidth: 260 }}
      />

      <Select
        size="sm"
        value={v.tagType || 'all'}
        onChange={(e, val) => onChange({ tagType: val || 'all' })}
        sx={{ minWidth: 180 }}
        renderValue={(selected) => {
          const id = selected?.value || ''
          const opt = TAG_TYPE_OPTIONS.find((o) => o.id === id)
          if (!opt) return selected?.label || ''

          return (
            <Stack direction="row" gap={1} alignItems="center">
              <Box sx={pageSx.renderBox(opt.color)}>
                {iconUi({
                  id: opt.idIcon,
                  sx: { fontSize: 12, color: '#fff', '& *': { fill: 'currentColor' } },
                })}
              </Box>
              {opt.labelH}
            </Stack>
          )
        }}
      >
        <Option value="all">כל הסוגים</Option>
        <Option value="analysis">
          {iconUi({ id: 'videoAnalysis', sx:{ color: getEntityColors('videoAnalysis').bg } })}
          תגי ניתוח וידאו
        </Option>
        <Option value="general">
          {iconUi({ id: 'videoGeneral', sx:{ color: getEntityColors('videoGeneral').bg } })}
          תגי וידאו כללי
        </Option>
      </Select>

      <Select
        size="sm"
        value={v.hierarchy || 'all'}
        onChange={(e, val) => onChange({ hierarchy: val || 'all' })}
        sx={{ minWidth: 160 }}
        renderValue={(selected) => {
          const id = selected?.value || ''
          const opt = TAG_PARENTS_OPTIONS.find((o) => o.id === id)
          if (!opt) return selected?.label || ''

          return (
            <Stack direction="row" gap={1} alignItems="center">
              <Box sx={pageSx.renderBox('#444444')}>
                {iconUi({
                  id: opt.idIcon,
                  sx: { fontSize: 12, color: '#fff', '& *': { fill: 'currentColor' } },
                })}
              </Box>
              {opt.labelH}
            </Stack>
          )
        }}
      >
        <Option value="all">כולם</Option>
        <Option value="parents">
        {iconUi({ id: 'parents' })}
        רק תגים ראשיים
        </Option>
        <Option value="children">
        {iconUi({ id: 'children' })}
        רק תתי תג
        </Option>
      </Select>

      <Chip
        size="sm"
        variant={v.showArchived ? 'solid' : 'soft'}
        onClick={() => onChange({ showArchived: !v.showArchived })}
        sx={{ cursor: 'pointer' }}
      >
        הצג ארכיון
      </Chip>
    </Box>
  )
}
