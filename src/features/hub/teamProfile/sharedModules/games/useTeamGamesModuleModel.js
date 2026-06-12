// src/features/hub/teamProfile/sharedModules/games/useTeamGamesModuleModel.js

import { useCallback, useMemo, useState } from 'react'

import {
  useTeamGamesCoreModel,
  useTeamGamesDeleteActions,
  useTeamGamesImportActions,
  useTeamGamesStatsActions,
  useTeamGamesUiState,
} from './model/index.js'

const getGameId = game => {
  return String(game?.gameId || game?.id || '').trim()
}

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

  const [deleteSelectionMode, setDeleteSelectionMode] = useState(false)
  const [selectedGameIds, setSelectedGameIds] = useState([])

  const selectedGameIdsSet = useMemo(() => {
    return new Set(selectedGameIds)
  }, [selectedGameIds])

  const handleEnterDeleteSelectionMode = useCallback(() => {
    setDeleteSelectionMode(true)
    setSelectedGameIds([])
  }, [])

  const handleExitDeleteSelectionMode = useCallback(() => {
    setDeleteSelectionMode(false)
    setSelectedGameIds([])
  }, [])

  const handleToggleGameSelection = useCallback(gameId => {
    if (!gameId) return

    setSelectedGameIds(prev => {
      const exists = prev.includes(gameId)

      if (exists) {
        return prev.filter(id => id !== gameId)
      }

      return [...prev, gameId]
    })
  }, [])

  const handleClearGameSelection = useCallback(() => {
    setSelectedGameIds([])
  }, [])

  const handleSelectAllVisibleGames = useCallback(() => {
    const visibleIds = core.sortedGames
      .map(getGameId)
      .filter(Boolean)

    setSelectedGameIds(visibleIds)
  }, [core.sortedGames])

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

  const deleteActions = useTeamGamesDeleteActions({
    liveTeam: core.liveTeam,
    games: core.calculationGames,
    selectedGameIds,
    onDeleteGamesBulk: context?.onDeleteGamesBulk,
  })

  const handleOpenSelectedDelete = useCallback(() => {
    deleteActions.handleOpenSelectedDelete()
  }, [deleteActions])

  const handleConfirmGamesDelete = useCallback(
    async plan => {
      await deleteActions.handleConfirmGamesDelete(plan)
      handleExitDeleteSelectionMode()
    },
    [deleteActions, handleExitDeleteSelectionMode]
  )

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

    gamesDeleteOpen: deleteActions.gamesDeleteOpen,
    gamesDeleteScope: deleteActions.gamesDeleteScope,
    gamesDeleteSaving: deleteActions.gamesDeleteSaving,
    gamesDeleteError: deleteActions.gamesDeleteError,

    deleteSelectionMode,
    selectedGameIds,
    selectedGameIdsSet,
    selectedGamesCount: selectedGameIds.length,

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

    handleEnterDeleteSelectionMode,
    handleExitDeleteSelectionMode,
    handleToggleGameSelection,
    handleClearGameSelection,
    handleSelectAllVisibleGames,

    handleOpenSelectedDelete,
    handleOpenAllTeamGamesDelete: deleteActions.handleOpenAllTeamGamesDelete,
    handleCloseGamesDelete: deleteActions.handleCloseGamesDelete,
    handleConfirmGamesDelete,
  }
}
