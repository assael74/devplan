// playerProfile/sharedModules/games/PlayerGamesModuleBase.js

import React from 'react'
import {
  Box,
  CircularProgress,
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import GameStatsCreateForm from '../../../../../ui/forms/gameStats/GameStatsCreateForm.js'
import { BulkPasteDrawer } from '../../../../bulkActions/publicApi.js'

import usePlayerGamesModuleModel from './usePlayerGamesModuleModel.js'
import { playerGamesModuleSx } from './playerGamesModule.sx.js'

const statsLoadingModalSx = {
  dialog: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 'lg',
  },
}

export default function PlayerGamesModuleBase({
  entity,
  context,
  profileData,
  gamesImportRequest = 0,
  gamesInsightsRequest = 0,
  seasonStartYear = 2025,

  Section,
  toolbarWrapSx,

  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
  EntryEditDrawerComponent,
  EditDrawerComponent,
}) {
  const model = usePlayerGamesModuleModel({
    entity,
    context,
    profileData,
    gamesImportRequest,
    gamesInsightsRequest,
    seasonStartYear,
  })

  const {
    livePlayer,
    liveTeam,
    playerScoring,

    summary,
    options,
    indicators,
    calculationGames,
    sortedGames,

    filters,
    sort,

    insightsOpen,
    editingEntryGame,
    editingGame,

    gamesImportOpen,
    gamesImportSaving,
    gamesImportError,

    statsFormLoading,
    statsFormLoadingText,
    editingStatsGame,
    activeStatsFormDraft,
    statsDeleteAction,
    statsSavePending,
    statsSaveError,

    hasRows,
    hasAnyGames,

    setInsightsOpen,
    setEditingEntryGame,
    setEditingGame,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleEditGame,

    handleCloseGamesImport,
    handleGamesImportPreviewReady,

    handleOpenStatsGame,
    handleSaveStats,
    handleDeleteStats,
    closeStatsForm,
    deleteStatsDraft,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || playerGamesModuleSx.desktopToolbarWrap

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            indicators={indicators}
            options={options}
            onChangeFilters={handleChangeFilters}
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
          />
        </Box>

        {!hasRows ? (
          <EmptyState
            title="אין משחקים"
            subtitle={
              hasAnyGames
                ? 'לא נמצאו משחקים לפי הפילטרים שנבחרו'
                : 'עדיין לא נוספו משחקים לשחקן'
            }
          />
        ) : (
          <ListComponent
            rows={sortedGames}
            player={livePlayer}
            scoring={playerScoring}
            onEdit={handleEditGame}
            onEditEntry={game => setEditingEntryGame(game || null)}
            onEditStatsGame={handleOpenStatsGame}
          />
        )}
      </Wrap>

      <EntryEditDrawerComponent
        open={!!editingEntryGame}
        game={editingEntryGame}
        onClose={() => setEditingEntryGame(null)}
        onSaved={() => setEditingEntryGame(null)}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <EditDrawerComponent
        open={!!editingGame}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSaved={() => setEditingGame(null)}
        context={{ ...context, playerId: livePlayer?.id, player: livePlayer }}
      />

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        summary={summary}
        games={calculationGames}
        player={livePlayer}
        team={liveTeam}
        scoring={playerScoring}
        profileData={profileData}
      />

      <BulkPasteDrawer
        open={gamesImportOpen}
        onClose={handleCloseGamesImport}
        title="ייבוא משחקים לשחקן"
        onPreviewReady={handleGamesImportPreviewReady}
        saving={gamesImportSaving}
        error={gamesImportError}
      />

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
          playerId: livePlayer?.id,
          player: livePlayer,
          game: editingStatsGame,
          source: 'playerProfile',
        }}
        savedDraft={activeStatsFormDraft}
        onClose={closeStatsForm}
        onSave={handleSaveStats}
        statsDeleteAction={statsDeleteAction}
        onDeleteDraft={deleteStatsDraft}
        onDeleteStats={handleDeleteStats}
        savePending={statsSavePending}
        saveError={statsSaveError}
      />
    </>
  )
}
