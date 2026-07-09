// features/hub/teamProfile/desktop/modules/players/components/toolbar/TeamPlayersToolbar.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../../../sharedLogic/players/print/index.js'

import {
  publishReport,
} from '../../../../../../../reports/index.js'

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

function getPublishTooltip(publishState) {
  if (publishState.error) {
    return 'יצירת הקישור נכשלה'
  }

  if (publishState.copied) {
    return 'קישור לגרסה החדשה הועתק'
  }

  return 'פרסם גרסה חדשה והעתק קישור'
}

function hasActivePlayerFilters(filters = {}) {
  return (
    !!filters.search ||
    !!filters.onlyActive ||
    !!filters.onlyWithTargets ||
    !!filters.squadRole ||
    !!filters.seasonPlanStatus ||
    !!filters.projectStatus ||
    !!filters.positionCode ||
    !!filters.performanceProfile ||
    !!filters.generalPositionKey
  )
}

export default function TeamPlayersToolbar({
  team,
  summary,
  filters,
  rows = [],
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
  const [publishState, setPublishState] = React.useState({
    loading: false,
    copied: false,
    error: false,
  })

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

  const hasActiveFilters = hasActivePlayerFilters(filters)
  const hasSortChanged = sortBy !== 'squadRole' || sortDirection !== 'desc'
  const canReset = hasActiveFilters || hasSortChanged
  const canPrint = rows.length > 0

  const handlePublishReport = async () => {
    if (!canPrint || publishState.loading) return

    setPublishState({
      loading: true,
      copied: false,
      error: false,
    })

    try {
      const result = await publishReport({
        team,
        rows,
        filters,
        summary,
        seasonLabel,
        mode: currentManagementPrintMode,
      })

      setPublishState({
        loading: false,
        copied: !!result.copied,
        error: !result.copied,
      })
    } catch (error) {
      console.error('[TeamPlayersToolbar] Failed to publish report', error)

      setPublishState({
        loading: false,
        copied: false,
        error: true,
      })
    }
  }

  const publishTooltip = getPublishTooltip(publishState)

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
            active={currentManagementPrintMode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN}
            disabled={isPerformanceView}
            icon='players'
            label='תכנון סגל'
            onClick={() => {
              onToggleManagementPrintMode(TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN)
            }}
          />

          <PrintModeChip
            active={currentManagementPrintMode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN}
            icon='playTimeRate'
            label='חלוקת דקות'
            onClick={() => {
              onToggleManagementPrintMode(TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN)
            }}
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

          <Tooltip title={publishTooltip} placement='top'>
            <span>
              <IconButton
                size='sm'
                variant='soft'
                color={publishState.error ? 'danger' : 'primary'}
                disabled={!canPrint || publishState.loading}
                onClick={handlePublishReport}
                aria-label='פרסום דוח ציבורי'
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {publishState.loading
                  ? <CircularProgress size='sm' />
                  : iconUi({ id: 'share' })}
              </IconButton>
            </span>
          </Tooltip>

          <Chip
            size='md'
            variant='soft'
            color='primary'
            sx={{
              '--Chip-radius': '7px',
              '--Chip-minHeight': '30px',
            }}
            startDecorator={iconUi({ id: 'players' })}
          >
            {filteredCount} / {totalCount} שחקנים
          </Chip>
        </Box>
      </Box>
    </Box>
  )
}
