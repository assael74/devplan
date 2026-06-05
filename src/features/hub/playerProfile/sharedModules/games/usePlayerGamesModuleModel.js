// src/features/hub/playerProfile/sharedModules/games/usePlayerGamesModuleModel.js

import {
  usePlayerGamesCoreModel,
  usePlayerGamesStatsActions,
  usePlayerGamesUiState,
} from './model/index.js'

export default function usePlayerGamesModuleModel({
  entity,
  context,
  profileData,
  gamesInsightsRequest = 0,
  seasonStartYear = 2025,
}) {
  const preCore = usePlayerGamesCoreModel({
    entity,
    context,
    profileData,
    filters: {},
    sort: { by: 'date', direction: 'desc' },
    seasonStartYear,
  })

  const ui = usePlayerGamesUiState({
    gamesInsightsRequest,
    isPrivatePlayer: preCore.isPrivatePlayer,
  })

  const core = usePlayerGamesCoreModel({
    entity,
    context,
    profileData,
    filters: ui.filters,
    sort: ui.sort,
    seasonStartYear,
  })

  const stats = usePlayerGamesStatsActions({
    livePlayer: core.livePlayer,
    liveTeam: core.liveTeam,
    contextPlayers: core.contextPlayers,
    statsFormLoadingApi: {
      setStatsFormLoading: ui.setStatsFormLoading,
      setStatsFormLoadingText: ui.setStatsFormLoadingText,
    },
  })

  return {
    livePlayer: core.livePlayer,
    liveTeam: core.liveTeam,
    playerScoring: core.playerScoring,
    isPrivatePlayer: core.isPrivatePlayer,

    summary: core.summary,
    games: core.games,
    options: core.options,
    indicators: core.indicators,
    calculationGames: core.calculationGames,
    sortedGames: core.sortedGames,

    filters: ui.filters,
    sort: ui.sort,

    insightsOpen: ui.insightsOpen,
    editingEntryGame: ui.editingEntryGame,
    editingGame: ui.editingGame,

    statsFormLoading: ui.statsFormLoading,
    statsFormLoadingText: ui.statsFormLoadingText,
    editingStatsGame: stats.editingStatsGame,
    activeStatsFormDraft: stats.activeStatsFormDraft,
    statsPayloadsByGameId: stats.statsPayloadsByGameId,
    statsDeleteAction: stats.statsDeleteAction,
    statsSavePending: stats.statsSavePending,
    statsSaveError: stats.statsSaveError,

    hasRows: core.hasRows,
    hasAnyGames: core.hasAnyGames,

    setInsightsOpen: ui.setInsightsOpen,
    setEditingEntryGame: ui.setEditingEntryGame,
    setEditingGame: ui.setEditingGame,

    handleChangeFilters: ui.handleChangeFilters,
    handleResetFilters: ui.handleResetFilters,
    handleChangeSortBy: ui.handleChangeSortBy,
    handleChangeSortDirection: ui.handleChangeSortDirection,
    handleEditGame: ui.handleEditGame,

    handleOpenStatsGame: stats.handleOpenStatsGame,
    handleSaveStats: stats.handleSaveStats,
    handleDeleteStats: stats.handleDeleteStats,
    closeStatsForm: stats.closeStatsForm,
    deleteStatsDraft: stats.deleteStatsDraft,
  }
}
