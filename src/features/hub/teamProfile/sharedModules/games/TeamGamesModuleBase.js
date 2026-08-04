// teamProfile/sharedModules/games/TeamGamesModuleBase.js

import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Modal,
  ModalDialog,
  Sheet,
  Typography,
} from '@mui/joy'

import GameStatsCreateForm from '../../../../../ui/forms/gameStats/GameStatsCreateForm.js'
import { useCreateModal } from '../../../../../ui/forms/create/CreateModalProvider.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  BulkPasteDrawer,
  GamesBulkDeleteModal,
  GAMES_DELETE_SCOPE,
} from '../../../../bulkActions/publicApi.js'

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
  const { openCreate } = useCreateModal()

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

  const handleCreateGame = () => {
    openCreate('game', {
      teamId: liveTeam?.id || '',
      clubId: context?.club?.id || liveTeam?.clubId || '',
    }, { team: liveTeam, ...(context || {}) })
  }

  return (
    <>
      <Wrap>
        {hasAnyGames ? (
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
        ) : null}

        {!hasRows ? (
          <Sheet variant="plain" sx={desktopTeamGamesModuleSx.emptyState}>
            <Box sx={desktopTeamGamesModuleSx.emptyIcon}>
              {iconUi({ id: hasAnyGames ? 'filters' : 'games' })}
            </Box>

            <Typography level="title-md" sx={desktopTeamGamesModuleSx.emptyTitle}>
              {hasAnyGames ? 'לא נמצאו משחקים לפי הסינון' : 'אין עדיין משחקים לקבוצה'}
            </Typography>

            <Typography level="body-sm" sx={desktopTeamGamesModuleSx.emptyText}>
              {hasAnyGames
                ? 'אפשר לאפס את המסננים כדי לחזור לרשימת המשחקים המלאה.'
                : 'יצירת משחק ראשון תפתח את אזור ניהול המשחקים, הסגל והמדדים.'}
            </Typography>

            <Button
              size="sm"
              variant="solid"
              onClick={hasAnyGames ? handleResetFilters : handleCreateGame}
              startDecorator={iconUi({ id: hasAnyGames ? 'reset' : 'addGame' })}
            >
              {hasAnyGames ? 'איפוס מסננים' : 'יצירת משחק'}
            </Button>
          </Sheet>
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
