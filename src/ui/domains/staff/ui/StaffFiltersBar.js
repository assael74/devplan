// C:\projects\devplan\src\ui\domains\staff\ui\StaffFiltersBar.js

import React from 'react'
import { Box, Input, Option, Select, Chip } from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'

export default function StaffFiltersBar({
  filters,
  onChange,
  roleOptions = [],
  contactOptions = [],
  resultCount = 0,
  totalCount = 0,
  compact = false
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
        {!compact && (
          <Input
            size="sm"
            placeholder="חיפוש איש צוות..."
            value={filters?.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            startDecorator={<SearchRounded />}
            sx={{ minWidth: 220, flex: 1 }}
          />
        )}

        <Select
          size="sm"
          value={filters?.roleType || 'all'}
          onChange={(e, v) => onChange({ roleType: v || 'all' })}
          sx={{ minWidth: 170 }}
        >
          {roleOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              {o.label}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.contact || 'all'}
          onChange={(e, v) => onChange({ contact: v || 'all' })}
          sx={{ minWidth: 145 }}
        >
          {contactOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              {o.label}
            </Option>
          ))}
        </Select>

        <Chip size="sm" variant="soft">
          {`מוצג: ${resultCount}/${totalCount}`}
        </Chip>
      </Box>
    </Box>
  )
}
