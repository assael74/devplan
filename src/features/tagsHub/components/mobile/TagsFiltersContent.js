// src/features/tagsHub/components/shared/TagsFiltersContent.js

import React from 'react'
import { Box, Input, Select, Option, Chip } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../ui/core/theme/Colors'
import {
  TAG_TYPE_OPTIONS,
  TAG_PARENTS_OPTIONS,
} from '../../../../shared/tags/tags.constants.js'

import { hubSx as sx } from './sx/hub.sx'

function findOpt(options, id) {
  return options.find((o) => o.id === id) || null
}

export default function TagsFiltersContent({
  value,
  onChange,
  layout = 'row',
}) {
  const v = value || {}
  const isColumn = layout === 'column'

  return (
    <Box sx={sx.contRoot(isColumn)}>
      <Input
        size="sm"
        placeholder="חיפוש תג / slug…"
        value={v.q || ''}
        onChange={(e) => onChange({ q: e.target.value })}
        startDecorator={iconUi({ id: 'search' })}
        sx={{ minWidth: isColumn ? 0 : 240, width: isColumn ? '100%' : 'auto' }}
      />

      <Select
        size="sm"
        value={v.tagType || 'all'}
        onChange={(e, val) => onChange({ tagType: val || 'all' })}
        sx={{ minWidth: isColumn ? 0 : 180, width: isColumn ? '100%' : 'auto' }}
        renderValue={(selected) => {
          const id = selected?.value || ''
          const opt = findOpt(TAG_TYPE_OPTIONS, id)

          if (!opt) return selected?.label || 'כל הסוגים'

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {iconUi({ id: opt.idIcon, sx: { color: opt.color } })}
              {opt.labelH}
            </Box>
          )
        }}
      >
        <Option value="all">כל הסוגים</Option>

        <Option value="analysis">
          {iconUi({id: 'videoAnalysis', sx: { color: getEntityColors('videoAnalysis').bg } })}
          תגי ניתוח וידאו
        </Option>

        <Option value="general">
          {iconUi({id: 'videoGeneral', sx: { color: getEntityColors('videoGeneral').bg}})}
          תגי וידאו כללי
        </Option>
      </Select>

      <Select
        size="sm"
        value={v.hierarchy || 'all'}
        onChange={(e, val) => onChange({ hierarchy: val || 'all' })}
        sx={{ minWidth: isColumn ? 0 : 160, width: isColumn ? '100%' : 'auto' }}
        renderValue={(selected) => {
          const id = selected?.value || ''
          const opt = findOpt(TAG_PARENTS_OPTIONS, id)

          if (!opt) return selected?.label || 'כולם'

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {iconUi({ id: opt.idIcon })}
              {opt.labelH}
            </Box>
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
        color={v.showArchived ? 'primary' : 'neutral'}
        onClick={() => onChange({ showArchived: !v.showArchived })}
        sx={{
          cursor: 'pointer',
          alignSelf: isColumn ? 'flex-start' : 'center',
          whiteSpace: 'nowrap',
        }}
      >
        הצג ארכיון
      </Chip>
    </Box>
  )
}
