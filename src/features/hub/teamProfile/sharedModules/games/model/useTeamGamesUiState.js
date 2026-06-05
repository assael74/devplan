// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesUiState.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialTeamGamesFilters,
} from '../../../sharedLogic/games'

export function useTeamGamesUiState({ gamesInsightsRequest = 0 } = {}) {
  const initialFilters = useMemo(() => createInitialTeamGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [statsFormLoading, setStatsFormLoading] = useState(false)
  const [statsFormLoadingText, setStatsFormLoadingText] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({ by: 'date', direction: 'desc' })
  const [performanceView, setPerformanceView] = useState('team')

  useEffect(() => {
    if (gamesInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [gamesInsightsRequest])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialTeamGamesFilters())
  }

  const handleChangeSortBy = value => {
    setSort(prev => ({
      ...prev,
      by: value,
    }))
  }

  const handleChangeSortDirection = value => {
    setSort(prev => ({
      ...prev,
      direction: value,
    }))
  }

  return {
    filters,
    sort,
    performanceView,

    insightsOpen,
    editingGame,
    editingEntryGame,
    statsFormLoading,
    statsFormLoadingText,

    setInsightsOpen,
    setEditingGame,
    setEditingEntryGame,
    setStatsFormLoading,
    setStatsFormLoadingText,
    setPerformanceView,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
  }
}
