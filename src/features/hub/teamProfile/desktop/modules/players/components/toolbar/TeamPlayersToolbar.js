// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersToolbar.js

import React from 'react'
import { Box, Button, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import ReportPrintButton from '../../../../../../../../ui/patterns/reportPrint/ReportPrintButton.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
  buildTeamPlayersPrintDocumentTitle,
} from '../../../../../sharedLogic/players/print/index.js'
import { TeamPlayersPrintReport } from '../../../../../sharedUi/players/print/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'
import TeamPlayersFiltersBar from './TeamPlayersFiltersBar.js'
import TeamPlayersSortMenu from './TeamPlayersSortMenu.js'

const VIEW_MODES = {
  OVERVIEW: 'overview',
  PERFORMANCE: 'performance',
}

function ViewModeChip({ active, icon, label, onClick }) {
  return (
    <Chip
      size='md'
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

function PrintModeChip({ active, disabled = false, icon, label, onClick }) {
  return (
    <Chip
      size='md'
      variant={active ? 'solid' : 'outlined'}
      color={active ? 'primary' : 'neutral'}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      sx={sx.filterChip}
      startDecorator={iconUi({ id: icon })}
    >
      {label}
    </Chip>
  )
}

function SelectionToolbar({
  selectedCount,
  allFilteredSelected,
  onToggleSelectAll,
  onDeleteSelected,
  onCancelSelection,
}) {
  return (
    <Box sx={sx.selectionToolbar}>
      <Typography level='title-sm' sx={sx.selectionCount}>
        {selectedCount} שחקנים נבחרו
      </Typography>

      <Button
        size='sm'
        variant='soft'
        color='neutral'
        onClick={onToggleSelectAll}
      >
        {allFilteredSelected ? 'בטל בחירת מוצגים' : 'בחר את כל המוצגים'}
      </Button>

      <Box sx={sx.selectionSpacer} />

      <Button
        size='sm'
        color='danger'
        disabled={!selectedCount}
        startDecorator={iconUi({ id: 'delete' })}
        onClick={onDeleteSelected}
      >
        מחק מסומנים
      </Button>

      <Button
        size='sm'
        variant='plain'
        color='neutral'
        startDecorator={iconUi({ id: 'close' })}
        onClick={onCancelSelection}
      >
        ביטול
      </Button>
    </Box>
  )
}

function getPrintMeta({ isPerformanceView, managementPrintMode }) {
  if (isPerformanceView) {
    return {
      mode: TEAM_PLAYERS_PRINT_MODES.PERFORMANCE,
      label: 'הדפסת ביצוע',
      tooltip: 'הדפסת ביצוע',
      color: 'primary',
    }
  }

  if (managementPrintMode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN) {
    return {
      mode: TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN,
      label: 'הדפסת חלוקת דקות',
      tooltip: 'הדפסת חלוקת דקות',
      color: 'neutral',
    }
  }

  return {
    mode: TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN,
    label: 'הדפסת תכנון סגל',
    tooltip: 'הדפסת תכנון סגל',
    color: 'neutral',
  }
}

export default function TeamPlayersToolbar({
  team,
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
  bulkEnabled = false,
  selectionMode = false,
  selectedCount = 0,
  allFilteredSelected = false,
  onStartSelection,
  onCancelSelection,
  onToggleSelectAll,
  onDeleteSelected,
  onChangeSearch,
  onToggleOnlyActive,
  onChangeSquadRole,
  onChangeSeasonPlanStatus,
  onChangeProjectStatus,
  onChangePositionCode,
  onChangePerformanceProfile,
  onChangeGeneralPositionKey,
  onChangeSortBy,
  onChangeSortDirection,
  onChangeViewMode,
  onToggleManagementPrintMode,
  managementPrintMode,
  seasonPlanStatusDisabled = false,
  onResetFilters,
  onToggleWithTargets,
}) {
  if (bulkEnabled && selectionMode) {
    return (
      <SelectionToolbar
        selectedCount={selectedCount}
        allFilteredSelected={allFilteredSelected}
        onToggleSelectAll={onToggleSelectAll}
        onDeleteSelected={onDeleteSelected}
        onCancelSelection={onCancelSelection}
      />
    )
  }

  const isPerformanceView = viewMode === VIEW_MODES.PERFORMANCE
  const currentManagementPrintMode =
    managementPrintMode || TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN

  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyWithTargets ||
    !!filters?.squadRole ||
    !!filters?.seasonPlanStatus ||
    !!filters?.projectStatus ||
    !!filters?.positionCode ||
    !!filters?.performanceProfile ||
    !!filters?.generalPositionKey

  const hasSortChanged = sortBy !== 'squadRole' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged
  const canPrint = rows.length > 0

  const printMeta = getPrintMeta({
    isPerformanceView,
    managementPrintMode: currentManagementPrintMode,
  })

  const isSeasonPlanPrint = currentManagementPrintMode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN

  const printTitle = buildTeamPlayersPrintDocumentTitle({
    mode: printMeta.mode,
    team,
    teamName,
  })

  const renderPrintReport = () => (
    <TeamPlayersPrintReport
      team={team}
      rows={rows}
      filters={filters}
      summary={summary}
      seasonLabel={seasonLabel}
      mode={printMeta.mode}
    />
  )

  return (
    <Box sx={sx.toolbar}>
      <TeamPlayersFiltersBar
        summary={summary}
        filters={filters}
        seasonPlanStatusDisabled={seasonPlanStatusDisabled}
        filteredCount={filteredCount}
        totalCount={totalCount}
        canReset={canReset}
        onChangeSearch={onChangeSearch}
        onToggleOnlyActive={onToggleOnlyActive}
        onChangeSquadRole={onChangeSquadRole}
        onChangeSeasonPlanStatus={onChangeSeasonPlanStatus}
        onChangeProjectStatus={onChangeProjectStatus}
        onChangePositionCode={onChangePositionCode}
        onChangePerformanceProfile={onChangePerformanceProfile}
        onChangeGeneralPositionKey={onChangeGeneralPositionKey}
        onToggleWithTargets={onToggleWithTargets}
        onResetFilters={onResetFilters}
      />

      <Box sx={sx.toolbarRow}>
        <TeamPlayersSortMenu
          sortBy={sortBy}
          sortDirection={sortDirection}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
        />

        <Box sx={sx.inlineIconGroup}>
          <StatusToggleIcon
            active={!!filters?.onlyWithTargets}
            icon='targets'
            title={filters?.onlyWithTargets ? 'עם יעדים' : 'בלי יעדים'}
            onClick={onToggleWithTargets}
          />

          <StatusToggleIcon
            active={!!filters?.onlyActive}
            icon='active'
            title={filters?.onlyActive ? 'שחקנים פעילים' : 'שחקנים לא פעילים'}
            onClick={onToggleOnlyActive}
          />
        </Box>

        <Box sx={sx.viewModeGroup}>
          <ViewModeChip
            active={viewMode === VIEW_MODES.OVERVIEW}
            icon='players'
            label='ניהול'
            onClick={() => onChangeViewMode?.(VIEW_MODES.OVERVIEW)}
          />

          <ViewModeChip
            active={isPerformanceView}
            icon='performanceProfile'
            label='ביצוע'
            onClick={() => onChangeViewMode?.(VIEW_MODES.PERFORMANCE)}
          />
        </Box>

        <Box sx={sx.viewModeGroup}>
          <PrintModeChip
            active={isSeasonPlanPrint}
            disabled={isPerformanceView}
            icon='players'
            label='תכנון סגל'
            onClick={() => onToggleManagementPrintMode?.(TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN)}
          />

          <PrintModeChip
            active={!isSeasonPlanPrint}
            icon='playTimeRate'
            label='חלוקת דקות'
            onClick={() => onToggleManagementPrintMode?.(TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN)}
          />
        </Box>

        <Box sx={sx.statusChipGroup}>
          {bulkEnabled ? (
            <IconButton
              size='sm'
              variant='soft'
              color='danger'
              disabled={!totalCount}
              onClick={onStartSelection}
              aria-label='מחיקת שחקנים'
            >
              {iconUi({ id: 'delete' })}
            </IconButton>
          ) : null}

          <ReportPrintButton
            label={printMeta.label}
            tooltip={printMeta.tooltip}
            documentTitle={printTitle}
            disabled={!canPrint}
            size='sm'
            variant='soft'
            color={printMeta.color}
            startIcon='download'
            iconOnly
            renderContent={renderPrintReport}
          />

          <Chip
            size='md'
            variant='soft'
            color='primary'
            sx={{ "--Chip-radius": "7px", "--Chip-minHeight": "30px" }}
            startDecorator={iconUi({ id: 'players' })}
          >
            {filteredCount} / {totalCount} שחקנים
          </Chip>
        </Box>
      </Box>
    </Box>
  )
}

function StatusToggleIcon({ active, icon, title, onClick }) {
  return (
    <Tooltip title={title} placement='top'>
      <IconButton
        size='sm'
        variant={active ? 'solid' : 'outlined'}
        color={active ? 'success' : 'neutral'}
        onClick={onClick}
        aria-label={title}
      >
        {iconUi({ id: icon })}
      </IconButton>
    </Tooltip>
  )
}
