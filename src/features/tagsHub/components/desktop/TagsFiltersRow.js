// src/features/tagsHub/components/desktop/TagsFiltersRow.js

import React from 'react'
import { Box, Input, Option, Select, Stack } from '@mui/joy'

import { VIDEO_TAG_TYPES } from '../../../../shared/video/index.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { tagSx as sx } from '../../tags.sx'

export default function TagsFiltersRow({ value, onChange }) {
  const v = value || {}

  return (
    <Box sx={sx.filtersRow}>
      <Input
        size="sm"
        placeholder="חיפוש לפי שם / slug / id..."
        value={v.q || ''}
        onChange={event => onChange({ q: event.target.value })}
        sx={{ minWidth: 280 }}
      />

      <Select
        size="sm"
        value={v.tagType || 'all'}
        onChange={(event, val) => onChange({ tagType: val || 'all' })}
        sx={{ minWidth: 220 }}
        renderValue={selected => {
          const id = selected?.value || 'all'
          const opt = VIDEO_TAG_TYPES.find(type => type.id === id)
          if (!opt) return 'כל סוגי התגיות'

          return (
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.iconId || 'tags' })}
              {opt.label}
            </Stack>
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
