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

import useTeamGamesModuleModel from './useTeamGamesModuleModel.js'

import {
  desktopTeamGamesModuleSx,
  statsLoadingModalSx,
} from './teamGamesModule.sx.js'

export default function TeamGamesModuleBase({
  entity,
  context,
  profileData,
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
          />
        )}
      </Wrap>

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
