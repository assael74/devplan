// src/features/hub/playerProfile/sharedModules/games/model/usePlayerGamesUiState.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialPlayerGamesFilters,
} from '../../../sharedLogic/games/module/index.js'

export function usePlayerGamesUiState({
  gamesInsightsRequest = 0,
  isPrivatePlayer = false,
} = {}) {
  const initialFilters = useMemo(() => createInitialPlayerGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [statsFormLoading, setStatsFormLoading] = useState(false)
  const [statsFormLoadingText, setStatsFormLoadingText] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({ by: 'date', direction: 'desc' })

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
    setFilters(createInitialPlayerGamesFilters())
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

  const handleEditGame = game => {
    if (!isPrivatePlayer) return

    setEditingGame(game || null)
  }

  return {
    filters,
    sort,

    insightsOpen,
    editingEntryGame,
    editingGame,
    statsFormLoading,
    statsFormLoadingText,

    setInsightsOpen,
    setEditingEntryGame,
    setEditingGame,
    setStatsFormLoading,
    setStatsFormLoadingText,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleEditGame,
  }
}
