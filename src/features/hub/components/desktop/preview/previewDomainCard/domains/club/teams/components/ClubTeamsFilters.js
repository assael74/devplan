// preview/previewDomainCard/domains/club/teams/components/ClubTeamsFilters.js

import React from 'react'
import { Box, Divider, IconButton, Input, Option, Select, Sheet, Tooltip, ListItemDecorator, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import { filtterSx as sx } from '../sx/clubTeamsFilters.sx'
import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('status')

function SelectValue({ option, id = 'active' }) {
  const label = option?.label || ''
  const colorAct = option.value === 'active' ? c.success.solid : option.value === 'notActive' ? c.danger.solid : ''
  const colorPro = option.value === 'project' ? c.success.solid : option.value === 'isNotProject' ? c.danger.solid : ''
  const color = id === 'active' ? colorAct : colorPro

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {iconUi({id: option.value, sx: { color: color } })}
      <Typography level="body-sm" noWrap>
        {label}
      </Typography>
    </Box>
  )
}

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

  const isDirty =
    (q || '').trim() !== '' ||
    active !== 'all' ||
    project !== 'all'

  const handleReset = () => {
    onChangeQ('')
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
          sx={{ minWidth: 0, width: '100%' }}
        />

        <Select
          size="sm"
          value={active}
          onChange={(e, v) => onChangeActive(v ?? 'all')}
          sx={{ minWidth: 0, width: '100%' }}
          renderValue={(selected) => (
            <SelectValue option={selected} id="active" />
          )}
        >
          <Option value="all" id='active'>
            <ListItemDecorator>{iconUi({id: 'active'})} </ListItemDecorator>
            כל הסטטוסים
          </Option>
          <Option value="active" id='active'>
           <ListItemDecorator>{iconUi({id: 'active', sx: { color: c.success.solid }})}</ListItemDecorator>
            פעילה
          </Option>
          <Option value="notActive" id='active'>
            <ListItemDecorator>{iconUi({id: 'notActive', sx: { color: c.danger.solid }})}</ListItemDecorator>
            לא פעילה
          </Option>
        </Select>

        <Select
          size="sm"
          value={project}
          onChange={(e, v) => onChangeProject(v ?? 'all')}
          sx={{ minWidth: 0, width: '100%' }}
          renderValue={(selected) => (
            <SelectValue option={selected} id="project" />
          )}
        >
          <Option value="all" id='project'>
            <ListItemDecorator>{iconUi({id: 'project'})}</ListItemDecorator>
            כל הקבוצות
          </Option>
          <Option value="project" id='project'>
           <ListItemDecorator>{iconUi({id: 'project', sx: { color: c.success.solid }})}</ListItemDecorator>
            קבוצות פרויקט
          </Option>
          <Option value="isNotProject" id='project'>
            <ListItemDecorator>{iconUi({id: 'isNotProject', sx: { color: c.danger.solid }})}</ListItemDecorator>
            לא פרויקט
          </Option>
        </Select>

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton
              disabled={!isDirty}
              size="sm"
              variant="outlined"
              sx={sx.icoResSx}
              onClick={handleReset}
            >
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="יצירת קבוצה חדשה">
          <span>
            <IconButton size="sm" variant="outlined" onClick={onCreateTeam} sx={sx.icoAddSx}>
              {iconUi({ id: 'addTeam', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ display: { xs: 'none', md: 'block' }, opacity: 0 }} />
    </Sheet>
  )
}
