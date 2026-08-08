// features/playersDatabase/ui/components/filters/FiltersBar.js

import * as React from 'react'
import {
  Card,
  Input,
  Option,
  Select,
  Stack,
} from '@mui/joy'

import { filtersBarSx as sx } from './filtersBar.sx.js'

export default function FiltersBar({ searchValue = '', onSearchChange, filters = [] }) {
  return (
    <Card sx={sx.card}>
      <Stack direction={{
        xs: 'column',
        md: 'row',
      }} spacing={1.25} alignItems='stretch'>
        <Input
          value={searchValue}
          onChange={event => onSearchChange(event.target.value)}
          placeholder='חיפוש שחקן, קבוצה, ליגה...'
          sx={sx.search}
        />

        {filters.map(filter => (
          <Select
            key={filter.key}
            value={filter.value || 'all'}
            onChange={(event, value) => filter.onChange(value)}
            sx={sx.filter}
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
