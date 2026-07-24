// teamProfile/sharedModules/players/TeamPlayersModuleBase.js

import React, { useState } from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'

import { PlayersBulkDeleteModal, PlayersBulkPasteDrawer } from '../../../../bulkActions/players/index.js'

import useTeamPlayersModuleModel from './useTeamPlayersModuleModel.js'
import { teamPlayersModuleSx } from './teamPlayersModule.sx.js'
import { TEAM_PLAYERS_PRINT_MODES } from '../../../../reports/model/teams/players/print/index.js'
import { TEAM_PLAYERS_VIEW_MODES } from './teamPlayersModule.constants.js'

export default function TeamPlayersModuleBase({
  entity,
  context,
  profileData,
  playersInsightsRequest = 0,
  playersImportRequest = 0,
  onPlayersInsightsStatusChange,
  onOpenPlayer,
  bulkEnabled = false,

  Section,
  ToolbarComponent,
  ListComponent,
  QuickEditDrawerComponent,
  PositionsDrawerComponent,
  InsightsDrawerComponent,

  toolbarWrapSx,
}) {
  const model = useTeamPlayersModuleModel({
    entity,
    context,
    profileData,
    playersInsightsRequest,
    playersImportRequest,
    onPlayersInsightsStatusChange,
    bulkEnabled,
  })

  const [managementPrintMode, setManagementPrintMode] = useState(
    TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
  )

  const {
    liveTeam,
    rowsWithPerformance,
    summaryWithPerformance,
    filteredRows,
    filters,
    sort,
    viewMode,
    insightsModel,
    insightsReady,
    insightsOpen,
    editingPlayer,
    editingPosition,
    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,
    selectionMode,
    selectedPlayerIds,
    selectedPlayerIdsSet,
    selectedCount,
    allFilteredSelected,
    setInsightsOpen,
    setEditingPlayer,
    setEditingPosition,
    setOpenImg,
    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleChangeViewMode: handleViewModeChange,
    handleAvatarClick,
    handleAfterImageSave,
    handleStartSelection,
    handleCancelSelection,
    handleTogglePlayerSelection,
    handleToggleSelectAll,
    handleOpenDelete,
    importDrawerProps,
    deleteModalProps,
  } = model

  const handleChangeViewMode = nextViewMode => {
    handleViewModeChange?.(nextViewMode)

    if (nextViewMode === TEAM_PLAYERS_VIEW_MODES.PERFORMANCE) {
      setManagementPrintMode(TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN)
    }
  }

  const isSeasonPlanStatusDisabled =
    viewMode === TEAM_PLAYERS_VIEW_MODES.PERFORMANCE ||
    managementPrintMode === TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN

  React.useEffect(() => {
    if (!isSeasonPlanStatusDisabled) return
    if (!filters?.seasonPlanStatus) return

    handleChangeFilters({ seasonPlanStatus: '' })
  }, [filters?.seasonPlanStatus, handleChangeFilters, isSeasonPlanStatusDisabled])

  const Wrap = Section
  const finalToolbarWrapSx = toolbarWrapSx || teamPlayersModuleSx.desktopToolbarWrap

  return (
    <Wrap>
      <Box sx={finalToolbarWrapSx}>
        <ToolbarComponent
          team={liveTeam}
          filters={filters}
          summary={summaryWithPerformance}
          filteredCount={filteredRows.length}
          totalCount={rowsWithPerformance.length}
          viewMode={viewMode}
          managementPrintMode={managementPrintMode}
          rows={filteredRows}
          teamName={liveTeam?.teamName || liveTeam?.name || ''}
          seasonLabel={profileData?.seasonLabel || context?.seasonLabel || ''}
          sortBy={sort.by}
          sortDirection={sort.direction}
          bulkEnabled={bulkEnabled}
          selectionMode={selectionMode}
          selectedCount={selectedCount}
          allFilteredSelected={allFilteredSelected}
          onStartSelection={handleStartSelection}
          onCancelSelection={handleCancelSelection}
          onToggleSelectAll={handleToggleSelectAll}
          onDeleteSelected={handleOpenDelete}
          onChangeViewMode={handleChangeViewMode}
          onToggleManagementPrintMode={(nextMode) => {
            setManagementPrintMode(currentMode => (
              nextMode || (
                currentMode === TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
                  ? TEAM_PLAYERS_PRINT_MODES.MINUTES_PLAN
                  : TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN
              )
            ))
          }}
          onChangeSearch={value => handleChangeFilters({ search: value })}
          onToggleOnlyActive={() => handleChangeFilters({ onlyActive: !filters.onlyActive })}
          onChangeSquadRole={value => handleChangeFilters({ squadRole: value || '' })}
          onChangeSeasonPlanStatus={value => handleChangeFilters({ seasonPlanStatus: value || '' })}
          onChangeProjectStatus={value => handleChangeFilters({ projectStatus: value || '' })}
          onChangePositionCode={value => handleChangeFilters({ positionCode: value || '' })}
          onChangeGeneralPositionKey={value => handleChangeFilters({ generalPositionKey: value || '' })}
          onChangePerformanceProfile={value => handleChangeFilters({ performanceProfile: value || '' })}
          onToggleWithTargets={() => handleChangeFilters({ onlyWithTargets: !filters.onlyWithTargets })}
          onResetFilters={handleResetFilters}
          onChangeSortBy={handleChangeSortBy}
          onChangeSortDirection={handleChangeSortDirection}
          seasonPlanStatusDisabled={isSeasonPlanStatusDisabled}
        />
      </Box>

      {filteredRows.length === 0 ? (
        <EmptyState title="אין שחקנים להצגה" subtitle="בדוק פילטרים או הוסף שחקן חדש" />
      ) : (
        <ListComponent
          rows={filteredRows}
          loaded={insightsReady}
          viewMode={viewMode}
          managementPrintMode={managementPrintMode}
          selectionMode={bulkEnabled && selectionMode}
          selectedPlayerIdsSet={selectedPlayerIdsSet}
          onTogglePlayerSelection={handleTogglePlayerSelection}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={handleAvatarClick}
          onEditPlayer={row => setEditingPlayer(row?.player || null)}
          onEditPosition={row => setEditingPosition(row?.player || null)}
        />
      )}

      <QuickEditDrawerComponent
        open={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSaved={() => {}}
      />

      <PositionsDrawerComponent
        open={!!editingPosition}
        player={editingPosition}
        onClose={() => setEditingPosition(null)}
        onSaved={() => {}}
      />

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={rowsWithPerformance}
        summary={summaryWithPerformance}
        entity={liveTeam}
        model={insightsModel}
        resetKey={playersInsightsRequest}
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="players"
        id={imgRow?.id}
        entityName={imgRow?.playerFullName}
        currentPhotoUrl={rowPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={handleAfterImageSave}
      />

      {bulkEnabled ? <PlayersBulkPasteDrawer {...importDrawerProps} /> : null}
      {bulkEnabled ? <PlayersBulkDeleteModal {...deleteModalProps} /> : null}
    </Wrap>
  )
}
