// teamProfile/sharedModules/games/TeamGamesModuleBase.js

import React from 'react'
import {
  Box,
  CircularProgress,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import GameStatsCreateForm from '../../../../../ui/forms/gameStatsForm/GameStatsCreateForm.js'
import { BulkPasteDrawer } from '../../../../bulkActions/games/import/index.js'
import {
  GamesBulkDeleteModal,
  GAMES_DELETE_SCOPE,
} from '../../../../bulkActions/games/delete/index.js'

import useTeamGamesModuleModel from './useTeamGamesModuleModel.js'

import {
  desktopTeamGamesModuleSx,
  statsLoadingModalSx,
} from './teamGamesModule.sx.js'

export default function TeamGamesModuleBase({
  entity,
  context,
  profileData,
  gamesImportRequest = 0,
  gamesInsightsRequest = 0,

  Section,
  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
  EditDrawerComponent,
  EntryEditDrawerComponent,

  toolbarWrapSx,
  enableStatsForm = false,
}) {
  const model = useTeamGamesModuleModel({
    entity,
    context,
    profileData,
    gamesImportRequest,
    gamesInsightsRequest,
    enableStatsForm,
  })

  const {
    liveTeam,
    calculationGames,

    teamScoring,
    playerScoring,
    teamScoringByGameId,
    playerScoringByGameId,
    scoringByGameId,

    summary,
    options,
    indicators,
    sortedGames,

    filters,
    sort,
    performanceView,

    insightsOpen,
    editingGame,
    editingEntryGame,

    gamesImportOpen,
    gamesImportSaving,
    gamesImportError,

    gamesDeleteOpen,
    gamesDeleteScope,
    gamesDeleteSaving,
    gamesDeleteError,

    deleteSelectionMode,
    selectedGameIds,
    selectedGameIdsSet,

    statsFormLoading,
    statsFormLoadingText,
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    statsSavePending,
    statsSaveError,

    hasRows,
    hasAnyGames,

    setInsightsOpen,
    setEditingGame,
    setEditingEntryGame,
    setPerformanceView,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,

    handleCloseGamesImport,
    handleGamesImportPreviewReady,

    handleEnterDeleteSelectionMode,
    handleExitDeleteSelectionMode,
    handleToggleGameSelection,
    handleClearGameSelection,
    handleSelectAllVisibleGames,
    handleOpenSelectedDelete,
    handleOpenAllTeamGamesDelete,
    handleCloseGamesDelete,
    handleConfirmGamesDelete,

    handleOpenStatsGame,
    handleSaveStats,
    statsDeleteAction,
    closeStatsForm,
    deleteStatsDraft,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx = toolbarWrapSx || desktopTeamGamesModuleSx.toolbarWrap

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onOpenInsights={() => setInsightsOpen(true)}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            performanceView={performanceView}
            onChangePerformanceView={setPerformanceView}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
            deleteSelectionMode={deleteSelectionMode}
            selectedGameIds={selectedGameIds}
            onEnterDeleteSelectionMode={handleEnterDeleteSelectionMode}
            onExitDeleteSelectionMode={handleExitDeleteSelectionMode}
            onSelectAllVisibleGames={handleSelectAllVisibleGames}
            onClearGameSelection={handleClearGameSelection}
            onOpenSelectedDelete={handleOpenSelectedDelete}
            onOpenAllTeamGamesDelete={handleOpenAllTeamGamesDelete}
          />
        </Box>

        {!hasRows ? (
          <EmptyState
            title="אין משחקים"
            subtitle={
              hasAnyGames
                ? 'לא נמצאו משחקים לפי הפילטרים שנבחרו'
                : 'עדיין לא נוספו משחקים לקבוצה'
            }
          />
        ) : (
          <ListComponent
            rows={sortedGames}
            teamScoring={teamScoring}
            playerScoring={playerScoring}
            performanceView={performanceView}
            onChangePerformanceView={setPerformanceView}
            teamScoringByGameId={teamScoringByGameId}
            playerScoringByGameId={playerScoringByGameId}
            onEditGame={game => setEditingGame(game || null)}
            onEditEntryGame={game => setEditingEntryGame(game || null)}
            onOpenStatsGame={enableStatsForm ? handleOpenStatsGame : undefined}
            statsDraftsByGameId={statsPayloadsByGameId}
            deleteSelectionMode={deleteSelectionMode}
            selectedGameIds={selectedGameIds}
            selectedGameIdsSet={selectedGameIdsSet}
            onToggleGameSelection={handleToggleGameSelection}
          />
        )}
      </Wrap>

      <BulkPasteDrawer
        open={gamesImportOpen}
        onClose={handleCloseGamesImport}
        title="ייבוא משחקים"
        onPreviewReady={handleGamesImportPreviewReady}
        saving={gamesImportSaving}
        error={gamesImportError}
      />

      <GamesBulkDeleteModal
        open={gamesDeleteOpen}
        onClose={handleCloseGamesDelete}
        team={liveTeam}
        games={calculationGames}
        selectedGameIds={selectedGameIds}
        initialScope={gamesDeleteScope || GAMES_DELETE_SCOPE.SELECTED}
        loading={gamesDeleteSaving}
        error={gamesDeleteError}
        onConfirmDelete={handleConfirmGamesDelete}
      />

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        summary={summary}
        games={calculationGames}
        team={liveTeam}
        teamScoring={teamScoring}
        playerScoring={playerScoring}
        scoringByGameId={scoringByGameId}
        profileData={profileData}
      />

      <EditDrawerComponent
        open={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />

      <EntryEditDrawerComponent
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => {}}
        context={{ ...context, teamId: liveTeam?.id, team: liveTeam }}
      />

      {enableStatsForm ? (
        <>
          <Modal open={statsFormLoading}>
            <ModalDialog sx={statsLoadingModalSx.dialog}>
              <CircularProgress size="md" />

              <Box>
                <Typography level="title-sm">
                  טוען טופס סטטיסטיקה
                </Typography>

                <Typography level="body-sm" color="neutral">
                  {statsFormLoadingText || 'בודק נתונים שמורים...'}
                </Typography>
              </Box>
            </ModalDialog>
          </Modal>

          <GameStatsCreateForm
            open={!!editingStatsGame}
            game={editingStatsGame}
            team={liveTeam}
            context={{
              ...context,
              teamId: liveTeam?.id,
              team: liveTeam,
              game: editingStatsGame,
            }}
            savedDraft={activeStatsFormDraft}
            onClose={closeStatsForm}
            onSave={handleSaveStats}
            statsDeleteAction={statsDeleteAction}
            onDeleteDraft={deleteStatsDraft}
            onDeleteStats={model.handleDeleteStats}
            savePending={statsSavePending}
            saveError={statsSaveError}
          />
        </>
      ) : null}
    </>
  )
}
