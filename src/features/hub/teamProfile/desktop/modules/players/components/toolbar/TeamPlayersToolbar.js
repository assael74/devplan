// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersToolbar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import TeamPlayersFiltersBar from './TeamPlayersFiltersBar.js'
import TeamPlayersSortMenu from './TeamPlayersSortMenu.js'

const getSortLabel = (sortBy) => {
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'age') return 'גיל'
  if (sortBy === 'level') return 'פוטנציאל'
  if (sortBy === 'timeRate') return 'דקות משחק'
  if (sortBy === 'goals') return 'שערים'
  if (sortBy === 'assists') return 'בישולים'
  if (sortBy === 'squadRole') return 'מעמד'
  if (sortBy === 'projectStatus') return 'סטטוס פרויקט'
  return 'פוטנציאל'
}

const getSortDirectionIcon = (sortDirection) => {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

const getSortDirectionLabel = (sortDirection) => {
  return sortDirection === 'asc' ? 'מהנמוך לגבוה' : 'מהגבוה לנמוך'
}

export default function TeamPlayersToolbar({
  summary,
  filters,
  totalCount = 0,
  filteredCount = 0,
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
  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.generalPositionKey

  const hasSortChanged = sortBy !== 'level' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged

  return (
    <Box sx={sx.toolbar}>
      <TeamPlayersFiltersBar
        summary={summary}
        filters={filters}
        onChangeSearch={onChangeSearch}
        onToggleOnlyActive={onToggleOnlyActive}
        onChangeSquadRole={onChangeSquadRole}
        onChangeProjectStatus={onChangeProjectStatus}
        onChangePositionCode={onChangePositionCode}
        onChangeGeneralPositionKey={onChangeGeneralPositionKey}
      />

      <Box sx={sx.toolbarRow}>
        <TeamPlayersSortMenu
          sortBy={sortBy}
          sortDirection={sortDirection}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
        />

        <Box sx={{ flex: 1 }} />

        <Chip
          size="md"
          variant="soft"
          color="primary"
          sx={sx.filterChip}
          startDecorator={iconUi({ id: 'players' })}
        >
          {filteredCount} / {totalCount} שחקנים
        </Chip>

        <Chip
          size="md"
          variant={filters?.onlyActive ? 'solid' : 'outlined'}
          color={filters?.onlyActive ? 'success' : 'neutral'}
          onClick={onToggleOnlyActive}
          sx={sx.filterChip}
          startDecorator={iconUi({
            id: 'active',
            sx: { color: !filters?.onlyActive ? '#f52516' : '' },
          })}
        >
          רק פעילים ({summary?.active ?? 0})
        </Chip>

        <Chip
          size="md"
          variant="soft"
          color="danger"
          disabled={!canReset}
          onClick={onResetFilters}
          sx={{ cursor: 'pointer', fontWeight: 700 }}
          startDecorator={iconUi({
            id: 'reset',
            sx: { color: !canReset ? '#f52516' : '' },
          })}
        >
          איפוס
        </Chip>
      </Box>
    </Box>
  )
}
