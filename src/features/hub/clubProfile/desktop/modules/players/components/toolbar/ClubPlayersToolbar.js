// clubProfile/desktop/modules/players/components/toolbar/ClubPlayersToolbar.js

import React from 'react'
import { Box, Input, Option, Select, Chip, ListItemDecorator, } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ClubPlayersBottomBar from './ClubPlayersBottomBar.js'

const renderSelectValue = (selected, items, fallbackLabel, fallbackIcon) => {
  const value = selected?.value || ''
  const item = items.find((x) => x.id === value)

  if (!item) {
    return (
      <>
        <ListItemDecorator sx={{ mr: 0.75, pt: 0.3 }}>
          {iconUi({ id: fallbackIcon })}
        </ListItemDecorator>
        {fallbackLabel}
      </>
    )
  }

  return (
    <>
      <ListItemDecorator sx={{ mr: 0.75, pt: 0.3 }}>
        {iconUi({ id: item.idIcon || fallbackIcon, sx: { color: item.color } })}
      </ListItemDecorator>
      {item.label} ({item.count || 0})
    </>
  )
}

export default function ClubPlayersToolbar({
  summary,
  filters,
  filteredCount = 0,
  totalCount = 0,
  sortBy = 'level',
  sortDirection = 'desc',
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangeGeneralPositionKey,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const squadRoleBuckets = Array.isArray(summary?.squadRoleBuckets) ? summary.squadRoleBuckets : []
  const projectStatusBuckets = Array.isArray(summary?.projectStatusBuckets) ? summary.projectStatusBuckets : []
  const positionCodeBuckets = Array.isArray(summary?.positionCodeBuckets) ? summary.positionCodeBuckets : []
  const generalPositionBuckets = Array.isArray(summary?.generalPositionBuckets) ? summary.generalPositionBuckets : []

  const totalPlayers = summary?.total

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.generalPositionKey

  const selectedPosition = positionCodeBuckets.find((x) => x.id === filters?.positionLayer)
  const hasSortChanged = sortBy !== 'level' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarRow}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeSearch(e.target.value)}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש שחקן לפי שם / שנתון / עמדה"
          size="sm"
          sx={{ width: 200, maxWidth: '100%', flexShrink: 0 }}
        />

        <Select
          size="sm"
          value={filters?.squadRole || ''}
          onChange={(_, value) => onChangeSquadRole(value || '')}
          placeholder="כל המעמדות"
          sx={sx.select}
          renderValue={(selected) =>
            renderSelectValue(selected, squadRoleBuckets, 'כל המעמדות', 'star')
          }
        >
          <Option value="">כל המעמדות</Option>

          {squadRoleBuckets.map((item) => (
            <Option key={item.id} value={item.id}>
              <ListItemDecorator>
                {iconUi({ id: item.idIcon || 'star', sx: { color: item.color } })}
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
          sx={sx.select}
          renderValue={(selected) =>
            renderSelectValue(selected, positionCodeBuckets, 'כל העמדות', 'position')
          }
        >
          <Option value="">כל העמדות</Option>

          {positionCodeBuckets.map((item) => (
            <Option key={item.id} value={item.id}>
              <ListItemDecorator>
                {iconUi({ id: item.idIcon || 'position', sx: { color: item.color } })}
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
          sx={sx.select}
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
                {iconUi({ id: item.idIcon || 'layers', sx: { color: item.color } })}
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
          sx={sx.select}
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
                {iconUi({ id: item.idIcon || 'project', sx: { color: item.color } })}
              </ListItemDecorator>
              {item.label} ({item.count || 0})
            </Option>
          ))}
        </Select>

        <Chip
          size="sm"
          variant={filters?.onlyActive ? 'solid' : 'soft'}
          color={filters?.onlyActive ? 'success' : 'neutral'}
          onClick={onToggleOnlyActive}
          startDecorator={iconUi({ id: 'active' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          פעילים ({summary?.active ?? 0})
        </Chip>

        <Box sx={{ flex: 1 }} />

        <Chip
          size="md"
          variant="soft"
          color="danger"
          disabled={!canReset}
          onClick={onResetFilters}
          sx={sx.resetBut}
          startDecorator={iconUi({id: 'reset', sx: { color: !canReset ? '#f52516' : '' } })}
        >
          איפוס
        </Chip>
      </Box>

      <ClubPlayersBottomBar
        summary={summary}
        totalPlayers={totalPlayers}
        filteredPlayers={filteredCount}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>

  )
}
