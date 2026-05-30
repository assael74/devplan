// teamProfile/sharedModules/games/useTeamGamesModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialTeamGamesFilters,
  resolveTeamGamesFiltersDomain,
  sortTeamGamesRows,
} from '../../sharedLogic/games'

import {
  createGameStatsDraftFromDoc,
} from '../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  getGameStatsDoc,
} from '../../../../../services/firestore/shorts/gameStats/index.js'

import {
  useGameStatsHubDrafts,
  useGameStatsHubUpdate,
} from '../../../hooks/games'

import {
  getCreatedStatsDocId,
  getGameId,
  getGameStatsDocId,
  isLocalDraftSave,
  mergeStatsDocId,
} from './teamGamesStats.helpers.js'

const buildStatsDeleteAction = ({
  editingStatsGame,
  activeStatsFormDraft,
  statsPayloadsByGameId,
}) => {
  const gameId = getGameId(editingStatsGame)

  const localDraft = gameId
    ? statsPayloadsByGameId?.[gameId]
    : null

  const hasLocalDraft = isLocalDraftSave(localDraft)

  if (hasLocalDraft) {
    return {
      type: 'localDraft',
      label: 'מחיקת טיוטה',
      color: 'danger',
      disabled: false,
    }
  }

  const firestoreDocId =
    getGameStatsDocId(editingStatsGame) ||
    activeStatsFormDraft?.gameStatsDocId ||
    activeStatsFormDraft?.statsDocId ||
    ''

  if (firestoreDocId) {
    return {
      type: 'firestoreStats',
      label: 'מחיקת טופס סטטיסטיקה',
      color: 'danger',
      disabled: false,
    }
  }

  return null
}

export default function useTeamGamesModuleModel({
  entity,
  context,
  profileData,
  gamesInsightsRequest = 0,
  enableStatsForm = false,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []

    return teams.find(t => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const calculationGames = useMemo(() => {
    return profileData?.games?.playedLeagueGames || []
  }, [profileData?.games?.playedLeagueGames])

  const teamScoring =
    profileData?.teamScoring ||
    profileData?.scoring?.team ||
    null

  const playerScoring =
    profileData?.playerScoring ||
    profileData?.scoring?.players ||
    profileData?.scoring ||
    null

  const teamScoringByGameId = teamScoring?.byGameId || {}
  const playerScoringByGameId = playerScoring?.byGameId || {}
  const scoringByGameId = profileData?.scoring?.byGameId || {}

  const initialFilters = useMemo(() => createInitialTeamGamesFilters(), [])

  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [editingEntryGame, setEditingEntryGame] = useState(null)
  const [statsFormLoading, setStatsFormLoading] = useState(false)
  const [statsFormLoadingText, setStatsFormLoadingText] = useState('')

  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })
  const [performanceView, setPerformanceView] = useState('team')

  const {
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    openStatsGame,
    closeStatsForm,
    saveStatsDraft,
    deleteStatsDraft,
    statsFormDraftsByGameId,
    completeStatsFirestoreSave,
  } = useGameStatsHubDrafts()

  const {
    runSave: saveStatsToFirestore,
    runDelete: deleteStatsFromFirestore,
    pending: statsSavePending,
    error: statsSaveError,
  } = useGameStatsHubUpdate()

  const domain = useMemo(() => {
    return resolveTeamGamesFiltersDomain(liveTeam, filters, {
      seasonStartYear: 2025,
      teamScoringByGameId,
    })
  }, [liveTeam, filters, teamScoringByGameId])

  const {
    summary,
    games: viewGames,
    options,
    indicators,
  } = domain || {}

  const sortedGames = useMemo(() => {
    return sortTeamGamesRows(viewGames, sort)
  }, [viewGames, sort])

  const statsDeleteAction = useMemo(() => {
    return buildStatsDeleteAction({
      editingStatsGame,
      activeStatsFormDraft,
      statsPayloadsByGameId,
    })
  }, [editingStatsGame, activeStatsFormDraft, statsPayloadsByGameId])

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

  const handleSaveStats = async saveModel => {
    if (!enableStatsForm) return

    const payload = saveModel?.payload
    const draft = saveModel?.draft

    if (!payload) return

    if (isLocalDraftSave(payload)) {
      saveStatsDraft({ payload, draft })
      return
    }

    const result = await saveStatsToFirestore(payload)
    const gameStatsDocId = getCreatedStatsDocId({ result, payload })

    completeStatsFirestoreSave(
      mergeStatsDocId({
        payload,
        draft,
        gameStatsDocId,
      })
    )
  }

  const handleOpenStatsGame = async game => {
    if (!enableStatsForm) return

    const gameId = getGameId(game)

    if (gameId && statsFormDraftsByGameId[gameId]) {
      openStatsGame(game)
      return
    }

    const gameStatsDocId = getGameStatsDocId(game)

    if (!gameStatsDocId) {
      openStatsGame(game)
      return
    }

    setStatsFormLoading(true)
    setStatsFormLoadingText('טוען סטטיסטיקה שמורה...')

    try {
      const statsDoc = await getGameStatsDoc({ gameStatsDocId })

      if (!statsDoc) {
        openStatsGame(game)
        return
      }

      const loadedDraft = createGameStatsDraftFromDoc({
        game,
        team: liveTeam,
        statsDoc,
      })

      openStatsGame(game, loadedDraft)
    } catch (err) {
      console.error('[handleOpenStatsGame] failed to load stats doc', err)
      openStatsGame(game)
    } finally {
      setStatsFormLoading(false)
      setStatsFormLoadingText('')
    }
  }

  const handleDeleteStats = async ({ draft, game, statsDeleteAction } = {}) => {
    if (!enableStatsForm) return

    const targetGame = game || editingStatsGame
    const gameId = getGameId(targetGame) || draft?.gameId || ''

    if (!gameId || !statsDeleteAction?.type) return

    if (statsDeleteAction.type === 'localDraft') {
      deleteStatsDraft(gameId)
      return
    }

    const gameStatsDocId =
      getGameStatsDocId(targetGame) ||
      draft?.gameStatsDocId ||
      draft?.statsDocId ||
      ''

    if (!gameStatsDocId) return

    await deleteStatsFromFirestore({
      gameId,
      teamId: liveTeam?.id || draft?.teamId || targetGame?.teamId || '',
      gameStatsDocId,
    })

    deleteStatsDraft(gameId)
    closeStatsForm()
  }

  const hasRows = Array.isArray(sortedGames) && sortedGames.length > 0

  const hasAnyGames =
    calculationGames.length > 0 ||
    (Array.isArray(liveTeam?.teamGames) && liveTeam.teamGames.length > 0)

  return {
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
    statsDeleteAction,
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
    handleDeleteStats,
    closeStatsForm,
    deleteStatsDraft,
  }
}
