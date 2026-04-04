// preview/previewDomainCard/domains/club/teams/components/ClubTeamsFilters.js

import React from 'react'
import { Box, Divider, IconButton, Input, Option, Select, Sheet, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import { filtterSx as sx } from '../sx/clubTeamsFilters.sx'

export default function ClubTeamsFilters({
  q,
  year = 'all',
  active = 'all',
  project = 'all',
  options = {},
  onChangeQ,
  onChangeYear,
  onChangeActive,
  onChangeProject,
  onCreateTeam,
}) {
  const yearOptions = Array.isArray(options?.yearOptions) ? options.yearOptions : []

  const isDirty =
    (q || '').trim() !== '' ||
    year !== 'all' ||
    active !== 'all' ||
    project !== 'all'

  const handleReset = () => {
    onChangeQ('')
    onChangeYear('all')
    onChangeActive('all')
    onChangeProject('all')
  }

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <Input
          size="sm"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder="חיפוש קבוצה או שנתון..."
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          sx={sx.searchBoxSx}
        />

        <Select
          size="sm"
          value={year}
          onChange={(e, v) => onChangeYear(v ?? 'all')}
          sx={sx.selectSx}
        >
          <Option value="all">כל השנתונים</Option>
          {yearOptions.map((y) => (
            <Option key={String(y)} value={String(y)}>
              שנתון {y}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={active}
          onChange={(e, v) => onChangeActive(v ?? 'all')}
          sx={sx.selectSx}
        >
          <Option value="all">כל הסטטוסים</Option>
          <Option value="true">פעילה</Option>
          <Option value="false">לא פעילה</Option>
        </Select>

        <Select
          size="sm"
          value={project}
          onChange={(e, v) => onChangeProject(v ?? 'all')}
          sx={sx.selectSx}
        >
          <Option value="all">כל הקבוצות</Option>
          <Option value="true">קבוצות פרויקט</Option>
          <Option value="false">לא פרויקט</Option>
        </Select>

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton
              disabled={!isDirty}
              size="sm"
              variant="soft"
              sx={sx.icoResSx}
              onClick={handleReset}
            >
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="יצירת קבוצה חדשה">
          <span>
            <IconButton size="sm" onClick={onCreateTeam} sx={sx.icoAddSx}>
              {iconUi({ id: 'addTeam', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ display: { xs: 'none', md: 'block' }, opacity: 0 }} />
    </Sheet>
  )
}
