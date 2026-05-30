// teamProfile/sharedModules/players/TeamPlayersModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'

import useTeamPlayersModuleModel from './useTeamPlayersModuleModel.js'
import { teamPlayersModuleSx } from './teamPlayersModule.sx.js'

export default function TeamPlayersModuleBase({
  entity,
  context,
  profileData,
  playersInsightsRequest = 0,
  onPlayersInsightsStatusChange,
  onOpenPlayer,

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
    onPlayersInsightsStatusChange,
  })

  const {
    liveTeam,

    rowsWithPerformance,
    summaryWithPerformance,
    filteredRows,

    filters,
    sort,

    insightsModel,
    insightsReady,

    insightsOpen,
    editingPlayer,
    editingPosition,

    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,

    setInsightsOpen,
    setEditingPlayer,
    setEditingPosition,
    setOpenImg,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleAvatarClick,
    handleAfterImageSave,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx = toolbarWrapSx || teamPlayersModuleSx.desktopToolbarWrap

  return (
    <Wrap>
      <Box sx={finalToolbarWrapSx}>
        <ToolbarComponent
          filters={filters}
          summary={summaryWithPerformance}
          filteredCount={filteredRows.length}
          totalCount={rowsWithPerformance.length}
          onChangeSearch={value =>
            handleChangeFilters({ search: value })
          }
          onToggleOnlyActive={() =>
            handleChangeFilters({ onlyActive: !filters.onlyActive })
          }
          onChangeSquadRole={value =>
            handleChangeFilters({ squadRole: value || '' })
          }
          onChangeProjectStatus={value =>
            handleChangeFilters({ projectStatus: value || '' })
          }
          onChangePositionCode={value =>
            handleChangeFilters({ positionCode: value || '' })
          }
          onChangeGeneralPositionKey={value =>
            handleChangeFilters({ generalPositionKey: value || '' })
          }
          onChangePerformanceProfile={value =>
            handleChangeFilters({ performanceProfile: value || '' })
          }
          onResetFilters={handleResetFilters}
          sortBy={sort.by}
          sortDirection={sort.direction}
          onChangeSortBy={handleChangeSortBy}
          onChangeSortDirection={handleChangeSortDirection}
        />
      </Box>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="אין שחקנים להצגה"
          subtitle="בדוק פילטרים או הוסף שחקן חדש"
        />
      ) : (
        <ListComponent
          rows={filteredRows}
          loaded={insightsReady}
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
    </Wrap>
  )
}
