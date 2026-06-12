// src/features/tagsHub/components/mobile/TagsFiltersContent.js

import React from 'react'
import { Box, Input, Option, Select } from '@mui/joy'

import { VIDEO_TAG_TYPES } from '../../../../shared/video/index.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { hubSx as sx } from './sx/hub.sx'

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
        placeholder="חיפוש לפי שם / slug / id..."
        value={v.q || ''}
        onChange={event => onChange({ q: event.target.value })}
        startDecorator={iconUi({ id: 'search' })}
        sx={{ minWidth: isColumn ? 0 : 240, width: isColumn ? '100%' : 'auto' }}
      />

      <Select
        size="sm"
        value={v.tagType || 'all'}
        onChange={(event, val) => onChange({ tagType: val || 'all' })}
        sx={{ minWidth: isColumn ? 0 : 180, width: isColumn ? '100%' : 'auto' }}
        renderValue={selected => {
          const id = selected?.value || 'all'
          const opt = VIDEO_TAG_TYPES.find(type => type.id === id)
          if (!opt) return 'כל סוגי התגיות'

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {iconUi({ id: opt.iconId || 'tags' })}
              {opt.label}
            </Box>
          )
        }}
      >
        <Option value="all">כל סוגי התגיות</Option>
        {VIDEO_TAG_TYPES.map(type => (
          <Option key={type.id} value={type.id}>
            {iconUi({ id: type.iconId || 'tags' })}
            {type.label}
          </Option>
        ))}
      </Select>
    </Box>
  )
}
