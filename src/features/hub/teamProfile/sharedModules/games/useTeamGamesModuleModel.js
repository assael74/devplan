// src/features/hub/teamProfile/sharedModules/games/useTeamGamesModuleModel.js

import {
  useTeamGamesCoreModel,
  useTeamGamesImportActions,
  useTeamGamesStatsActions,
  useTeamGamesUiState,
} from './model/index.js'

export default function useTeamGamesModuleModel({
  entity,
  context,
  profileData,
  gamesImportRequest = 0,
  gamesInsightsRequest = 0,
  enableStatsForm = false,
}) {
  const ui = useTeamGamesUiState({ gamesInsightsRequest })

  const core = useTeamGamesCoreModel({
    entity,
    context,
    profileData,
    filters: ui.filters,
    sort: ui.sort,
  })

  const stats = useTeamGamesStatsActions({
    liveTeam: core.liveTeam,
    enableStatsForm,
    statsFormLoadingApi: {
      setStatsFormLoading: ui.setStatsFormLoading,
      setStatsFormLoadingText: ui.setStatsFormLoadingText,
    },
  })

  const importActions = useTeamGamesImportActions({
    liveTeam: core.liveTeam,
    context,
    gamesImportRequest,
  })

  return {
    liveTeam: core.liveTeam,
    calculationGames: core.calculationGames,

    teamScoring: core.teamScoring,
    playerScoring: core.playerScoring,
    teamScoringByGameId: core.teamScoringByGameId,
    playerScoringByGameId: core.playerScoringByGameId,
    scoringByGameId: core.scoringByGameId,

    summary: core.summary,
    options: core.options,
    indicators: core.indicators,
    sortedGames: core.sortedGames,

    filters: ui.filters,
    sort: ui.sort,
    performanceView: ui.performanceView,

    insightsOpen: ui.insightsOpen,
    editingGame: ui.editingGame,
    editingEntryGame: ui.editingEntryGame,

    statsFormLoading: ui.statsFormLoading,
    statsFormLoadingText: ui.statsFormLoadingText,
    editingStatsGame: stats.editingStatsGame,
    activeStatsFormDraft: stats.activeStatsFormDraft,
    statsPayloadsByGameId: stats.statsPayloadsByGameId,
    statsDeleteAction: stats.statsDeleteAction,
    statsSavePending: stats.statsSavePending,
    statsSaveError: stats.statsSaveError,

    gamesImportOpen: importActions.gamesImportOpen,
    gamesImportSaving: importActions.gamesImportSaving,
    gamesImportError: importActions.gamesImportError,

    hasRows: core.hasRows,
    hasAnyGames: core.hasAnyGames,

    setInsightsOpen: ui.setInsightsOpen,
    setEditingGame: ui.setEditingGame,
    setEditingEntryGame: ui.setEditingEntryGame,
    setPerformanceView: ui.setPerformanceView,

    handleChangeFilters: ui.handleChangeFilters,
    handleResetFilters: ui.handleResetFilters,
    handleChangeSortBy: ui.handleChangeSortBy,
    handleChangeSortDirection: ui.handleChangeSortDirection,

    handleOpenStatsGame: stats.handleOpenStatsGame,
    handleSaveStats: stats.handleSaveStats,
    handleDeleteStats: stats.handleDeleteStats,
    closeStatsForm: stats.closeStatsForm,
    deleteStatsDraft: stats.deleteStatsDraft,

    handleOpenGamesImport: importActions.handleOpenGamesImport,
    handleCloseGamesImport: importActions.handleCloseGamesImport,
    handleGamesImportPreviewReady: importActions.handleGamesImportPreviewReady,
  }
}
