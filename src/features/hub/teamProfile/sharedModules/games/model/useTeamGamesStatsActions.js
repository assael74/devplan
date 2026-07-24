// src/features/hub/teamProfile/sharedModules/games/model/useTeamGamesStatsActions.js

import { useMemo } from 'react'

import {
  createGameStatsDraftFromDoc,
} from '../../../../../../ui/forms/gameStatsForm/logic/index.js'

import {
  buildProfileStatsDeleteAction,
  loadProfileGameStats,
  resolveStatsDocumentId,
  saveProfileGameStats,
} from '../../../../sharedProfile/logic/games/index.js'

import {
  useGameStatsHubDrafts,
  useGameStatsHubUpdate,
} from '../../../../hooks/games'

import {
  getCreatedStatsDocId,
  getGameId,
  getGameStatsDocId,
  isLocalDraftSave,
  mergeStatsDocId,
} from '../teamGamesStats.helpers.js'

function resolveDeleteTeamId({ liveTeam, draft, targetGame }) {
  if (liveTeam && liveTeam.id) return liveTeam.id
  if (draft && draft.teamId) return draft.teamId
  if (targetGame && targetGame.teamId) return targetGame.teamId

  return ''
}

function buildLoadedDraft({ game, liveTeam, statsDoc }) {
  return createGameStatsDraftFromDoc({
    game,
    team: liveTeam,
    statsDoc,
  })
}

export function useTeamGamesStatsActions({
  liveTeam,
  enableStatsForm,
  statsFormLoadingApi,
}) {
  const {
    setStatsFormLoading,
    setStatsFormLoadingText,
  } = statsFormLoadingApi

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

  const statsDeleteAction = useMemo(() => {
    return buildProfileStatsDeleteAction({
      editingStatsGame,
      activeStatsFormDraft,
      statsPayloadsByGameId,
      getGameId,
      getGameStatsDocId,
      isLocalDraftSave,
    })
  }, [editingStatsGame, activeStatsFormDraft, statsPayloadsByGameId])

  const handleSaveStats = async saveModel => {
    if (!enableStatsForm) return

    await saveProfileGameStats({
      saveModel,
      isLocalDraftSave,
      saveStatsDraft,
      saveStatsToFirestore,
      getCreatedStatsDocId,
      mergeStatsDocId,
      completeStatsFirestoreSave,
    })
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

    await loadProfileGameStats({
      gameStatsDocId,
      onLoadingChange: (loading, text) => {
        setStatsFormLoading(loading)
        setStatsFormLoadingText(text)
      },
      onLoaded: statsDoc => {
        const loadedDraft = buildLoadedDraft({
          game,
          liveTeam,
          statsDoc,
        })

        openStatsGame(game, loadedDraft)
      },
      onMissing: () => openStatsGame(game),
      onError: () => openStatsGame(game),
      errorLabel: '[handleOpenStatsGame] failed to load stats doc',
    })
  }

  const handleDeleteStats = async ({ draft, game, statsDeleteAction } = {}) => {
    if (!enableStatsForm) return

    const targetGame = game || editingStatsGame
    const gameId = getGameId(targetGame) || (draft && draft.gameId) || ''

    if (!gameId) return
    if (!statsDeleteAction || !statsDeleteAction.type) return

    if (statsDeleteAction.type === 'localDraft') {
      deleteStatsDraft(gameId)
      return
    }

    const gameStatsDocId = resolveStatsDocumentId({
      game: targetGame,
      draft,
      getGameStatsDocId,
    })

    if (!gameStatsDocId) return

    await deleteStatsFromFirestore({
      gameId,
      teamId: resolveDeleteTeamId({ liveTeam, draft, targetGame }),
      gameStatsDocId,
    })

    deleteStatsDraft(gameId)
    closeStatsForm()
  }

  return {
    editingStatsGame,
    activeStatsFormDraft,
    statsPayloadsByGameId,
    statsDeleteAction,
    statsSavePending,
    statsSaveError,

    handleOpenStatsGame,
    handleSaveStats,
    handleDeleteStats,
    closeStatsForm,
    deleteStatsDraft,
  }
}
