// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersFiltersBar.js

import React from 'react'
import {
  Box,
  Input,
  ListItemDecorator,
  Option,
  Select,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const renderSelectValue = (selected, items, fallbackLabel, fallbackIcon) => {
  const value = selected?.value || ''
  const item = items.find((x) => x.id === value)

  if (!item) {
    return (
      <>
        <ListItemDecorator sx={{ mr: 0.5 }}>
          {iconUi({ id: fallbackIcon })}
        </ListItemDecorator>
        {fallbackLabel}
      </>
    )
  }

  return (
    <>
      <ListItemDecorator sx={{ mr: 0.5 }}>
        {iconUi({ id: item.idIcon || fallbackIcon })}
      </ListItemDecorator>
      {item.label} ({item.count || 0})
    </>
  )
}

export default function TeamPlayersFiltersBar({
  summary,
  filters,
  onChangeSearch,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeGeneralPositionKey,
}) {
  const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
  const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []
  const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets) ? summary.positionCodeBuckets : []
  const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets) ? summary.generalPositionBuckets : []

  return (
    <Box sx={sx.toolbarRow}>
      <Input
        value={filters?.search || ''}
        onChange={(e) => onChangeSearch(e.target.value)}
        startDecorator={iconUi({ id: 'search' })}
        placeholder="חיפוש שחקן לפי שם / שנתון / עמדה"
        size="sm"
        sx={{ width: 220, maxWidth: '100%', flexShrink: 0 }}
      />

      <Select
        size="sm"
        value={filters?.squadRole || ''}
        onChange={(_, value) => onChangeSquadRole(value || '')}
        placeholder="כל המעמדות"
        sx={sx.positionSelect}
        renderValue={(selected) =>
          renderSelectValue(selected, squadRoleBuckets, 'כל המעמדות', 'star')
        }
      >
        <Option value="">כל המעמדות</Option>

        {squadRoleBuckets.map((item) => (
          <Option key={item.id} value={item.id}>
            <ListItemDecorator>
              {iconUi({ id: item.idIcon || 'star' })}
            </ListItemDecorator>
            {item.label} ({item.count || 0})
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={filters?.positionCode || ''}
        onChange={(_, value) => onChangePositionCode(value || '')}
        placeholder="כל העמדות"
        sx={sx.positionSelect}
        renderValue={(selected) =>
          renderSelectValue(selected, positionCodeBuckets, 'כל העמדות', 'position')
        }
      >
        <Option value="">כל העמדות</Option>

        {positionCodeBuckets.map((item) => (
          <Option key={item.id} value={item.id}>
            <ListItemDecorator>
              {iconUi({ id: item.idIcon || 'position' })}
            </ListItemDecorator>
            {item.label} ({item.count || 0})
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={filters?.generalPositionKey || ''}
        onChange={(_, value) => onChangeGeneralPositionKey(value || '')}
        placeholder="כל העמדות הכלליות"
        sx={sx.positionSelect}
        renderValue={(selected) =>
          renderSelectValue(
            selected,
            generalPositionBuckets,
            'כל העמדות הכלליות',
            'layers'
          )
        }
      >
        <Option value="">כל העמדות הכלליות</Option>

        {generalPositionBuckets.map((item) => (
          <Option key={item.id} value={item.id}>
            <ListItemDecorator>
              {iconUi({ id: item.idIcon || 'layers' })}
            </ListItemDecorator>
            {item.label} ({item.count || 0})
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={filters?.projectStatus || ''}
        onChange={(_, value) => onChangeProjectStatus(value || '')}
        placeholder="כל סטטוסי הפרויקט"
        sx={sx.positionSelect}
        renderValue={(selected) =>
          renderSelectValue(
            selected,
            projectStatusBuckets,
            'כל סטטוסי הפרויקט',
            'project'
          )
        }
      >
        <Option value="">כל סטטוסי הפרויקט</Option>

        {projectStatusBuckets.map((item) => (
          <Option key={item.id} value={item.id}>
            <ListItemDecorator>
              {iconUi({ id: item.idIcon || 'project' })}
            </ListItemDecorator>
            {item.label} ({item.count || 0})
          </Option>
        ))}
      </Select>
    </Box>
  )
}
