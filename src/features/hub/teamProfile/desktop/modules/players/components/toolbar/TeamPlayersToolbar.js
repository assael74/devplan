import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import ReportPrintButton from '../../../../../../../../ui/patterns/reportPrint/ReportPrintButton.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import TeamPlayersFiltersBar from './TeamPlayersFiltersBar.js'
import TeamPlayersSortMenu from './TeamPlayersSortMenu.js'
import TeamPlayersPrintReport from '../print/TeamPlayersPrintReport.js'

const VIEW_MODES = {
  OVERVIEW: 'overview',
  PERFORMANCE: 'performance',
}

const PRINT_MODES = {
  SQUAD: 'squad',
  PERFORMANCE: 'performance',
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
  rows = [],
  teamName = '',
  seasonLabel = '',
  totalCount = 0,
  filteredCount = 0,
  sortBy = 'squadRole',
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
  onToggleWithTargets,
}) {
  const isPerformanceView = viewMode === VIEW_MODES.PERFORMANCE

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyWithTargets ||
    !!filters?.squadRole ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.performanceProfile ||
    !!filters?.generalPositionKey

  const hasSortChanged = sortBy !== 'squadRole' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged
  const canPrint = Array.isArray(rows) && rows.length > 0
  const printMode = isPerformanceView ? PRINT_MODES.PERFORMANCE : PRINT_MODES.SQUAD
  const printLabel = isPerformanceView ? 'הדפס ביצוע' : 'הדפס סגל'
  const printTooltip = isPerformanceView
    ? 'הדפס דוח יעדים וביצוע'
    : 'הדפס דוח סגל עם מקום ליעדים'
  const printTitle = isPerformanceView
    ? 'דוח יעדים וביצוע שחקנים'
    : 'דוח סגל שחקנים'
  const printColor = isPerformanceView ? 'primary' : 'neutral'

  const renderPrintReport = mode => (
    <TeamPlayersPrintReport
      rows={rows}
      filters={filters}
      summary={summary}
      teamName={teamName}
      seasonLabel={seasonLabel}
      mode={mode}
    />
  )

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
            label="ניהול"
            onClick={() => onChangeViewMode?.(VIEW_MODES.OVERVIEW)}
          />

          <ViewModeChip
            active={isPerformanceView}
            icon="performanceProfile"
            label="ביצוע"
            onClick={() => onChangeViewMode?.(VIEW_MODES.PERFORMANCE)}
          />
        </Box>

        <ReportPrintButton
          label={printLabel}
          tooltip={printTooltip}
          documentTitle={printTitle}
          disabled={!canPrint}
          size="sm"
          variant="soft"
          color={printColor}
          startIcon="download"
          renderContent={() => renderPrintReport(printMode)}
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
