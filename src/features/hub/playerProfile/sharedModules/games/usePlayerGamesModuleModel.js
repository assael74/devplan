// playerProfile/sharedModules/games/usePlayerGamesModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialPlayerGamesFilters,
  resolvePlayerGamesFiltersDomain,
  sortPlayerGamesRows,
} from '../../sharedLogic/games/module/index.js'

import {
  isLeagueGame,
  isPrivatePlayerEntity,
} from './playerGamesModule.helpers.js'

export default function usePlayerGamesModuleModel({
  entity,
  context,
  profileData,
  gamesInsightsRequest = 0,
  seasonStartYear = 2025,
}) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []

    return players.find(player => player?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const isPrivatePlayer = isPrivatePlayerEntity(livePlayer)

  const liveTeam = useMemo(() => {
    return context?.team || profileData?.entity?.team || livePlayer?.team || null
  }, [context?.team, profileData?.entity?.team, livePlayer])

  const playerScoring = useMemo(() => {
    return (
      profileData?.playerScoring ||
      profileData?.scoring?.player ||
      null
    )
  }, [profileData])

  const initialFilters = useMemo(() => createInitialPlayerGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [editingStatsGame, setEditingStatsGame] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })

  const domain = useMemo(() => {
    return resolvePlayerGamesFiltersDomain(livePlayer, filters, {
      seasonStartYear,
      scoring: playerScoring,
      profileData,
    })
  }, [livePlayer, filters, seasonStartYear, playerScoring, profileData])

  const {
    summary,
    games,
    options,
    indicators,
  } = domain || {}

  const calculationGames = useMemo(() => {
    const rows = Array.isArray(games) ? games : []

    return rows.filter(isLeagueGame)
  }, [games])

  const sortedGames = useMemo(() => {
    return sortPlayerGamesRows(games, sort)
  }, [games, sort])

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

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0

  const hasAnyGames =
    Array.isArray(livePlayer?.playerGames) &&
    livePlayer.playerGames.length > 0

  return {
    livePlayer,
    liveTeam,
    playerScoring,
    isPrivatePlayer,

    summary,
    games,
    options,
    indicators,
    calculationGames,
    sortedGames,

    filters,
    sort,

    insightsOpen,
    editingEntryGame,
    editingGame,
    editingStatsGame,

    hasRows,
    hasAnyGames,

    setInsightsOpen,
    setEditingEntryGame,
    setEditingGame,
    setEditingStatsGame,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleEditGame,
  }
}
