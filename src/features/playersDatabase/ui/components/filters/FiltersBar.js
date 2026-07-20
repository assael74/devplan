// features/playersDatabase/ui/components/filters/FiltersBar.js

import * as React from 'react'
import { Card, Input, Option, Select, Stack } from '@mui/joy'

export default function FiltersBar({ searchValue = '', onSearchChange, filters = [] }) {
  return (
    <Card sx={{ borderRadius: 8, border: '1px solid #dbe5f4' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems='stretch'>
        <Input
          value={searchValue}
          onChange={event => onSearchChange(event.target.value)}
          placeholder='חיפוש שחקן, קבוצה, ליגה...'
          sx={{ minWidth: { md: 320 } }}
        />

        {filters.map(filter => (
          <Select
            key={filter.key}
            value={filter.value || 'all'}
            onChange={(event, value) => filter.onChange(value)}
            sx={{ minWidth: 170 }}
          >
            {(filter.options || []).map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        ))}
      </Stack>
    </Card>
  )
}
