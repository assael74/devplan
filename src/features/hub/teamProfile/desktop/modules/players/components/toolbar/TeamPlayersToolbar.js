// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersToolbar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import TeamPlayersFiltersBar from './TeamPlayersFiltersBar.js'
import TeamPlayersSortMenu from './TeamPlayersSortMenu.js'

const VIEW_MODES = {
  OVERVIEW: 'overview',
  TARGETS: 'targets',
}

function ViewModeChip({
  active,
  icon,
  label,
  onClick,
}) {
  return (
    <Chip
      size="md"
      variant={active ? 'solid' : 'outlined'}
      color={active ? 'primary' : 'neutral'}
      onClick={onClick}
      sx={sx.filterChip}
      startDecorator={iconUi({ id: icon })}
    >
      {label}
    </Chip>
  )
}

export default function TeamPlayersToolbar({
  summary,
  filters,
  totalCount = 0,
  filteredCount = 0,
  sortBy = 'level',
  sortDirection = 'desc',
  viewMode = VIEW_MODES.OVERVIEW,
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangePerformanceProfile,
  onChangeGeneralPositionKey,
  onChangeSortBy,
  onChangeSortDirection,
  onChangeViewMode,
  onResetFilters,
  onToggleWithTargets
}) {
  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyWithTargets  ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.performanceProfile ||
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
        onChangePerformanceProfile={onChangePerformanceProfile}
        onChangeGeneralPositionKey={onChangeGeneralPositionKey}
      />

      <Box sx={sx.toolbarRow}>
        <TeamPlayersSortMenu
          sortBy={sortBy}
          sortDirection={sortDirection}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
        />

        <Box sx={sx.viewModeGroup}>
          <ViewModeChip
            active={viewMode === VIEW_MODES.OVERVIEW}
            icon="players"
            label="ניהול סגל"
            onClick={() => onChangeViewMode?.(VIEW_MODES.OVERVIEW)}
          />

          <ViewModeChip
            active={viewMode === VIEW_MODES.TARGETS}
            icon="target"
            label="יעדים וביצוע"
            onClick={() => onChangeViewMode?.(VIEW_MODES.TARGETS)}
          />
        </Box>

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
          variant={filters?.onlyWithTargets ? 'solid' : 'outlined'}
          color={filters?.onlyWithTargets ? 'success' : 'neutral'}
          onClick={onToggleWithTargets}
          sx={sx.filterChip}
          startDecorator={iconUi({ id: 'targets' })}
        >
          עם יעדים ({summary?.targetsSummary?.withTargets ?? 0})
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
