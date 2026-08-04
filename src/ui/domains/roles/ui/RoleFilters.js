// src/ui/domains/roles/ui/RoleFilters.js

import React from 'react'
import { Box, Chip, Input, Option, Select } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { rolesSx } from './roles.sx.js'

export default function RoleFilters({
  filters,
  onChange,
  roleOptions = [],
  contactOptions = [],
  assignmentOptions = [],
  teamOptions = [],
  resultCount = 0,
  totalCount = 0,
  compact = false,
  pageMode = false,
}) {
  return (
    <Box sx={rolesSx.filters(pageMode)}>
      <Box sx={rolesSx.filtersRow}>
        {!compact && (
          <Input
            size="sm"
            placeholder="חיפוש לפי שם, תפקיד, טלפון, מייל או שיוך"
            value={filters?.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            startDecorator={iconUi({ id: 'search' })}
            sx={rolesSx.searchInput}
          />
        )}

        <Select
          size="sm"
          value={filters?.roleType || 'all'}
          onChange={(e, value) => onChange({ roleType: value || 'all' })}
          sx={rolesSx.filterSelect(170)}
        >
          {roleOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.contact || 'all'}
          onChange={(e, value) => onChange({ contact: value || 'all' })}
          sx={rolesSx.filterSelect(160)}
        >
          {contactOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.assignment || 'all'}
          onChange={(e, value) => onChange({ assignment: value || 'all' })}
          sx={rolesSx.filterSelect(170)}
        >
          {assignmentOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.team || 'all'}
          onChange={(e, value) => onChange({ team: value || 'all' })}
          sx={rolesSx.filterSelect(160)}
        >
          {teamOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Box sx={{ flex: 1, minWidth: 8 }} />

        <Chip size="sm" variant="soft" color="neutral" sx={rolesSx.resultChip}>
          {`מוצגים: ${resultCount}/${totalCount}`}
        </Chip>
      </Box>
    </Box>
  )
}
